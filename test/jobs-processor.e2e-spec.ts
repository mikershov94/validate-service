import request from 'supertest';
import type { Server } from 'node:http';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobsModule } from '../src/jobs/jobs.module';
import { CreateJobResponseDto } from '../src/jobs/dto/create-job-response.dto';
import { JobStatus } from '../src/jobs/consts/job-status.const';
import { GetJobDetailsDto } from '../src/jobs/dto/get-job-details.dto';
import { UrlCheckStatus } from '../src/jobs/consts/url-check-status.const';
import { UrlCheckerService } from '../src/jobs/services/url-checker.service';
import { DelayService } from '../src/jobs/services/delay.service';
import { UrlCheckErrorMessage } from '../src/jobs/consts/url-check-errors.const';

const MAX_ATTEMPTS = 20;
const POLLING_INTERVAL_MS = 50;

describe('JobsProcessor (e2e)', () => {
    let app: INestApplication;
    let urlCheckerMock: jest.Mocked<Pick<UrlCheckerService, 'check'>>;
    let delayServiceMock: jest.Mocked<Pick<DelayService, 'wait'>>;

    beforeEach(async () => {
        urlCheckerMock = {
            check: jest.fn().mockResolvedValue(HttpStatus.OK),
        };

        delayServiceMock = {
            wait: jest.fn().mockResolvedValue(undefined),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [JobsModule],
        })
            .overrideProvider(UrlCheckerService)
            .useValue(urlCheckerMock)
            .overrideProvider(DelayService)
            .useValue(delayServiceMock)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('процессор обрабатывает Job и устанавливает completed', async () => {
        const server = app.getHttpServer() as Server;

        const createResponse = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://example.com'],
            })
            .expect(201);

        const { jobId } = createResponse.body as CreateJobResponseDto;

        let completedJob: GetJobDetailsDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get(`/jobs/${jobId}`).expect(200);

            const job = response.body as GetJobDetailsDto;

            if (job.status === JobStatus.completed) {
                completedJob = job;
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(completedJob).toBeDefined();
        expect(completedJob?.id).toBe(jobId);
        expect(completedJob?.status).toBe(JobStatus.completed);
        expect(completedJob?.createdAt).toEqual(expect.any(String));
        expect(completedJob?.updatedAt).toEqual(expect.any(String));
        expect(completedJob?.urlChecks).toHaveLength(1);

        const urlCheck = completedJob?.urlChecks[0];

        expect(urlCheck).toBeDefined();
        expect(urlCheck?.url).toBe('https://example.com');
        expect(urlCheck?.status).toBe(UrlCheckStatus.success);
        expect(urlCheck?.httpCode).toBe(200);
        expect(urlCheck?.startedAt).toEqual(expect.any(String));
        expect(urlCheck?.endedAt).toEqual(expect.any(String));
        expect(urlCheck?.duration).toBeGreaterThanOrEqual(0);
    });

    it('процессор устанавливает failed для Job, если хотя бы один URL завершился ошибкой', async () => {
        urlCheckerMock.check.mockResolvedValue(HttpStatus.NOT_FOUND);
        delayServiceMock.wait.mockResolvedValue(undefined);

        const server = app.getHttpServer() as Server;

        const createResponse = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://example.com/not-found'],
            })
            .expect(201);

        const { jobId } = createResponse.body as CreateJobResponseDto;

        let failedJob: GetJobDetailsDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get(`/jobs/${jobId}`).expect(200);

            const job = response.body as GetJobDetailsDto;

            if (job.status === JobStatus.failed) {
                failedJob = job;
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(failedJob).toBeDefined();
        expect(failedJob?.id).toBe(jobId);
        expect(failedJob?.status).toBe(JobStatus.failed);
        expect(failedJob?.createdAt).toEqual(expect.any(String));
        expect(failedJob?.updatedAt).toEqual(expect.any(String));
        expect(failedJob?.urlChecks).toHaveLength(1);

        const urlCheck = failedJob?.urlChecks[0];

        expect(urlCheck).toBeDefined();
        expect(urlCheck?.url).toBe('https://example.com/not-found');
        expect(urlCheck?.status).toBe(UrlCheckStatus.error);
        expect(urlCheck?.httpCode).toBe(HttpStatus.NOT_FOUND);
        expect(urlCheck?.errorMessage).toBe(UrlCheckErrorMessage.CLIENT_ERROR);
    });

    it('процессор отменяет Job и помечает не начатые URL как cancelled', async () => {
        urlCheckerMock.check.mockResolvedValue(200);
        delayServiceMock.wait.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(resolve, 100);
                }),
        );

        const urls = Array.from({ length: 20 }, (_, index) => `https://example${index + 1}.com`);

        const server = app.getHttpServer() as Server;

        const createResponse = await request(server).post('/jobs').send({ urls }).expect(201);

        const { jobId } = createResponse.body as CreateJobResponseDto;

        await request(server).delete(`/jobs/${jobId}`).expect(204);

        let cancelledJob: GetJobDetailsDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get(`/jobs/${jobId}`).expect(200);

            const job = response.body as GetJobDetailsDto;

            if (job.status === JobStatus.cancelled) {
                cancelledJob = job;
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(cancelledJob).toBeDefined();
        expect(cancelledJob?.id).toBe(jobId);
        expect(cancelledJob?.status).toBe(JobStatus.cancelled);
        expect(cancelledJob?.urlChecks).toHaveLength(20);

        const cancelledChecks = cancelledJob!.urlChecks.filter(
            (check) => check.status === UrlCheckStatus.cancelled,
        );

        expect(cancelledChecks.length).toBeGreaterThan(0);
        cancelledChecks.forEach((check) => {
            expect(check.url).toEqual(expect.any(String));
            expect(check.status).toBe(UrlCheckStatus.cancelled);
        });
    });

    afterEach(async () => {
        await app.close();
    });
});
