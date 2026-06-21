import request from 'supertest';
import type { Server } from 'node:http';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobsModule } from '../src/jobs/jobs.module';
import { CreateJobResponseDto } from '../src/jobs/dto/create-job-response.dto';
import { GetJobsResponseDto } from '../src/jobs/dto/get-jobs-response.dto';
import { JobStatus } from '../src/jobs/consts/job-status.const';
import { GetJobDetailsDto } from 'src/jobs/dto/get-job-details.dto';
import { UrlCheckerService } from '../src/jobs/services/url-checker.service';
import { DelayService } from '../src/jobs/services/delay.service';
import { UrlCheckStatus } from '../src/jobs/consts/url-check-status.const';

const MAX_ATTEMPTS = 20;
const POLLING_INTERVAL_MS = 50;

describe('JobsController (e2e)', () => {
    let app: INestApplication;
    let urlCheckerMock: {
        check: jest.Mock;
    };

    let delayServiceMock: {
        wait: jest.Mock;
    };

    beforeEach(async () => {
        urlCheckerMock = {
            check: jest.fn(),
        };

        delayServiceMock = {
            wait: jest.fn(),
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

    it('/jobs (POST) создает job и возвращает jobId', async () => {
        const server = app.getHttpServer() as Server;
        const response = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://example.com'],
            })
            .expect(201);

        const body = response.body as CreateJobResponseDto;

        expect(typeof body.jobId).toBe('string');
        expect(body.jobId).not.toHaveLength(0);
    });

    it('/jobs (GET) возвращает список созданных Jobs с краткой информацией', async () => {
        urlCheckerMock.check.mockResolvedValue(200);
        delayServiceMock.wait.mockResolvedValue(undefined);

        const server = app.getHttpServer() as Server;

        const response_1 = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://job1.com'],
            })
            .expect(201);

        const response_2 = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://job2.com', 'https://job3.com'],
            })
            .expect(201);

        const postBody_1 = response_1.body as CreateJobResponseDto;
        const postBody_2 = response_2.body as CreateJobResponseDto;

        const getResponse = await request(server).get('/jobs').expect(200);

        const body = getResponse.body as GetJobsResponseDto[];

        expect(body).toHaveLength(2);

        const firstJob = body.find((job) => job.id === postBody_1.jobId);
        const secondJob = body.find((job) => job.id === postBody_2.jobId);

        expect(firstJob).toBeDefined();
        expect(secondJob).toBeDefined();

        expect(firstJob?.id).toBe(postBody_1.jobId);
        expect(firstJob?.createdAt).toEqual(expect.any(String));
        expect(firstJob?.updatedAt).toEqual(expect.any(String));
        expect(firstJob?.status).toEqual(expect.any(String));
        expect(firstJob?.urlCount).toBe(1);
        expect(firstJob?.successCount).toEqual(expect.any(Number));
        expect(firstJob?.errorCount).toEqual(expect.any(Number));

        expect(secondJob?.id).toBe(postBody_2.jobId);
        expect(secondJob?.createdAt).toEqual(expect.any(String));
        expect(secondJob?.updatedAt).toEqual(expect.any(String));
        expect(secondJob?.status).toEqual(expect.any(String));
        expect(secondJob?.urlCount).toBe(2);
        expect(secondJob?.successCount).toEqual(expect.any(Number));
        expect(secondJob?.errorCount).toEqual(expect.any(Number));
    });

    it('/jobs/:id (GET) возвращает информацию по Job и по каждому URL в Job', async () => {
        urlCheckerMock.check.mockResolvedValue(200);
        delayServiceMock.wait.mockResolvedValue(undefined);

        const urls = ['https://example.com'];

        const server = app.getHttpServer() as Server;

        const postResponse = await request(server).post('/jobs').send({ urls }).expect(201);

        const { jobId } = postResponse.body as CreateJobResponseDto;

        let completedJob: GetJobDetailsDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get(`/jobs/${jobId}`).expect(HttpStatus.OK);

            const job = response.body as GetJobDetailsDto;

            if (job.status === JobStatus.completed) {
                completedJob = job;
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(completedJob).toBeDefined();
        expect(completedJob?.id).toBe(jobId);
        expect(completedJob?.urlChecks).toHaveLength(1);

        const urlCheck = completedJob!.urlChecks[0];

        expect(urlCheck.url).toBe('https://example.com');
        expect(urlCheck.status).toBe(UrlCheckStatus.success);
        expect(urlCheck.httpCode).toBe(HttpStatus.OK);
        expect(urlCheck.startedAt).toEqual(expect.any(String));
        expect(urlCheck.endedAt).toEqual(expect.any(String));
        expect(urlCheck.duration).toBeGreaterThanOrEqual(0);
    });

    it('/jobs (GET) возвращает статистику для completed Job', async () => {
        urlCheckerMock.check.mockResolvedValue(HttpStatus.OK);
        delayServiceMock.wait.mockResolvedValue(undefined);

        const server = app.getHttpServer() as Server;

        const createResponse = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://success1.com', 'https://success2.com'],
            })
            .expect(201);

        const { jobId } = createResponse.body as CreateJobResponseDto;

        let completedJob: GetJobsResponseDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get('/jobs').expect(HttpStatus.OK);

            const jobs = response.body as GetJobsResponseDto[];

            completedJob = jobs.find((job) => job.id === jobId);

            if (completedJob?.status === JobStatus.completed) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(completedJob).toBeDefined();

        expect(completedJob).toEqual({
            id: jobId,
            status: JobStatus.completed,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            urlCount: 2,
            successCount: 2,
            errorCount: 0,
        });
    });

    it('/jobs (GET) возвращает статистику для failed Job', async () => {
        urlCheckerMock.check
            .mockResolvedValueOnce(HttpStatus.OK)
            .mockResolvedValueOnce(HttpStatus.NOT_FOUND)
            .mockResolvedValueOnce(HttpStatus.OK);

        delayServiceMock.wait.mockResolvedValue(undefined);

        const server = app.getHttpServer() as Server;

        const createResponse = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://success1.com', 'https://error.com', 'https://success2.com'],
            })
            .expect(201);

        const { jobId } = createResponse.body as CreateJobResponseDto;

        let failedJob: GetJobsResponseDto | undefined;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const response = await request(server).get('/jobs').expect(HttpStatus.OK);

            const jobs = response.body as GetJobsResponseDto[];

            failedJob = jobs.find((job) => job.id === jobId);

            if (failedJob?.status === JobStatus.failed) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        }

        expect(failedJob).toBeDefined();

        expect(failedJob).toEqual({
            id: jobId,
            status: JobStatus.failed,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            urlCount: 3,
            successCount: 2,
            errorCount: 1,
        });
    });

    it('/jobs/:id (DELETE) помечает Job как cancelled и прекращает обработку URL', async () => {
        const server = app.getHttpServer() as Server;

        const { body } = await request(server)
            .post('/jobs')
            .send({
                urls: ['https://job1.com', 'https://job2.com'],
            })
            .expect(201);

        const { jobId } = body as CreateJobResponseDto;

        await request(server).delete(`/jobs/${jobId}`).expect(200);

        const { body: getBody } = await request(server).get(`/jobs/${jobId}`).expect(200);

        const job = getBody as GetJobDetailsDto;

        expect(job.status).toBe(JobStatus.cancelled);
    });

    afterEach(async () => {
        await app.close();
    });
});
