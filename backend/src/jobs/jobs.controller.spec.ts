import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CreateJobResponseDto } from './dto/create-job-response.dto';
import { CreateJobRequestDto } from './dto/create-job-request.dto';
import { GetJobsResponseDto } from './dto/get-jobs-response.dto';
import { JobStatus } from './consts/job-status.const';
import { UrlCheckStatus } from './consts/url-check-status.const';
import { JobId } from './entities/job.entity';
import { GetJobDetailsDto } from './dto/get-job-details.dto';

describe('JobsController', () => {
    let controller: JobsController;
    let service: jest.Mocked<Omit<JobsService, 'repository'>>;

    beforeAll(async () => {
        service = {
            createJob: jest.fn(),
            getJobsList: jest.fn(),
            getUrlChecks: jest.fn(),
            cancelJob: jest.fn(),
            getJob: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [JobsController],
            providers: [
                {
                    provide: JobsService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<JobsController>(JobsController);
    });

    it('должен быть определен', () => {
        expect(controller).toBeDefined();
    });

    it('createJob должен вызвать метод сервиса createJob и вернуть ожидаемый ответ', () => {
        const dto: CreateJobRequestDto = {
            urls: ['https://example.com'],
        };

        const expectedResponse: CreateJobResponseDto = {
            jobId: 'job-1',
        };

        service.createJob.mockReturnValue(expectedResponse.jobId);

        const result = controller.createJob(dto);

        expect(service.createJob).toHaveBeenCalledWith(dto.urls);
        expect(result).toEqual(expectedResponse);
    });

    it('getJobsList должен вызывать метод сервиса и возвращать ожидаемый ответ', () => {
        const expectedResponse: GetJobsResponseDto[] = [
            {
                id: 'job-1',
                status: JobStatus.pending,
                createdAt: new Date('2026-06-20T10:00:00.000Z'),
                updatedAt: new Date('2026-06-20T10:00:00.000Z'),
                urlCount: 1,
                successCount: 0,
                errorCount: 0,
            },
            {
                id: 'job-2',
                status: JobStatus.completed,
                createdAt: new Date('2026-06-20T11:00:00.000Z'),
                updatedAt: new Date('2026-06-20T11:00:00.000Z'),
                urlCount: 5,
                successCount: 4,
                errorCount: 1,
            },
        ];

        service.getJobsList.mockReturnValue(expectedResponse);

        const result = controller.getJobsList();

        expect(service.getJobsList).toHaveBeenCalled();
        expect(result).toEqual(expectedResponse);
    });

    it('getJobDetails должен вызывать метод сервиса и возвращать ожидаемый ответ', () => {
        const jobId: JobId = 'job-1';
        const expectedResponse: GetJobDetailsDto = {
            id: jobId,
            status: JobStatus.inProgress,
            createdAt: new Date('2026-06-20T10:00:00.000Z'),
            updatedAt: new Date('2026-06-20T10:01:00.000Z'),

            urlChecks: [
                {
                    url: 'https://example1.com',
                    status: UrlCheckStatus.pending,
                },
                {
                    url: 'https://example2.com',
                    status: UrlCheckStatus.success,
                    httpCode: 200,
                    startedAt: new Date('2026-06-20T10:00:10.000Z'),
                    endedAt: new Date('2026-06-20T10:00:11.000Z'),
                    duration: 150,
                },
            ],
        };

        service.getJob.mockReturnValue(expectedResponse);

        const result = controller.getJobDetails(jobId);

        expect(service.getJob).toHaveBeenCalledWith(jobId);
        expect(result).toEqual(expectedResponse);
    });

    it('cancelJob должен вызывать соответствующий метод сервиса с переданным jobId', () => {
        const jobId: JobId = 'job-1';

        controller.cancelJob(jobId);

        expect(service.cancelJob).toHaveBeenCalledWith(jobId);
    });
});
