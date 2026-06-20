import request from 'supertest';
import type { Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobsModule } from '../src/jobs/jobs.module';
import { CreateJobResponseDto } from '../src/jobs/dto/create-job-response.dto';
import { JobStatus } from '../src/jobs/consts/job-status.const';
import { GetJobDetailsDto } from '../src/jobs/dto/get-job-details.dto';
import { UrlCheckStatus } from '../src/jobs/consts/url-check-status.const';

const MAX_ATTEMPTS = 20;
const POLLING_INTERVAL_MS = 50;

describe('JobsProcessor (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [JobsModule],
        }).compile();

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

    afterEach(async () => {
        await app.close();
    });
});
