import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobsModule } from '../src/jobs/jobs.module';
import { CreateJobResponseDto } from '../src/jobs/dto/create-job-response.dto';
import type { Server } from 'node:http';

describe('JobsController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [JobsModule],
        }).compile();

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

    afterEach(async () => {
        await app.close();
    });
});
