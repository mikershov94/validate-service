import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { Job, JobId, UrlCheck } from './entities/job.entity';
import { JobStatus } from './consts/job-status.const';
import { UrlCheckStatus } from './consts/url-check-status.const';
import { JobInfo } from './interfaces/job-info.interface';
import { JobsProcessor } from './processors/jobs-processor.service';

describe('JobsService', () => {
    let service: JobsService;
    let repository: jest.Mocked<Omit<JobsRepository, 'store'>>;
    let processor: jest.Mocked<Pick<JobsProcessor, 'process'>>;

    beforeAll(async () => {
        repository = {
            create: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            getUrlChecksByJobId: jest.fn(),
            markCancelled: jest.fn(),
            markInProgress: jest.fn(),
            markPendingUrlChecksCancelled: jest.fn(),
            markUrlCheckError: jest.fn(),
            markUrlCheckSuccess: jest.fn(),
            setStatus: jest.fn(),
        };

        processor = {
            process: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                {
                    provide: JobsRepository,
                    useValue: repository,
                },
                {
                    provide: JobsProcessor,
                    useValue: processor,
                },
            ],
        }).compile();

        service = module.get<JobsService>(JobsService);
    });

    it('должен быть определен', () => {
        expect(service).toBeDefined();
    });

    it('createJob должен вызвать создание Job и вернуть jobId', () => {
        const urls = ['https://example.com'];
        const jobId: JobId = '123';

        repository.create.mockReturnValue(jobId);

        const result = service.createJob(urls);

        expect(repository.create).toHaveBeenCalled();
        expect(result).toBe(jobId);
    });

    it('createJob должен вызвать обработку Job после создания', () => {
        const urls = ['https://example.com'];
        const jobId: JobId = '123';

        repository.create.mockReturnValue(jobId);
        processor.process.mockResolvedValue(undefined);

        service.createJob(urls);

        expect(repository.create).toHaveBeenCalled();
        expect(processor.process).toHaveBeenCalledWith(jobId);
    });

    it('getJobList должен вызывать метод репозитория и возврвщать список', () => {
        const now = new Date();

        const repoFixtures: Job[] = [
            {
                id: 'job-1',
                status: JobStatus.pending,
                createdAt: now,
                updatedAt: now,
                urlChecks: [
                    { url: 'https://example1.com', status: UrlCheckStatus.pending },
                    { url: 'https://example2.com', status: UrlCheckStatus.error },
                ],
            },
            {
                id: 'job-2',
                status: JobStatus.completed,
                createdAt: now,
                updatedAt: now,
                urlChecks: [
                    { url: 'https://example3.com', status: UrlCheckStatus.success },
                    { url: 'https://example4.com', status: UrlCheckStatus.success },
                    { url: 'https://example5.com', status: UrlCheckStatus.error },
                ],
            },
        ];

        const serviceFixtures: JobInfo[] = [
            {
                id: 'job-1',
                status: JobStatus.pending,
                createdAt: now,
                updatedAt: now,
                urlCount: 2,
                successCount: 0,
                errorCount: 1,
            },
            {
                id: 'job-2',
                status: JobStatus.completed,
                createdAt: now,
                updatedAt: now,
                urlCount: 3,
                successCount: 2,
                errorCount: 1,
            },
        ];

        repository.getList.mockReturnValue(repoFixtures);

        const result = service.getJobsList();

        expect(repository.getList).toHaveBeenCalled();
        expect(result).toEqual(serviceFixtures);
    });

    it('getJob вызывает метод репозитория и возвращает Job по переданному id', () => {
        const now = new Date();
        const jobId = 'job-1';

        const fixture: Job = {
            id: jobId,
            status: JobStatus.pending,
            createdAt: now,
            updatedAt: now,
            urlChecks: [
                { url: 'https://example1.com', status: UrlCheckStatus.pending },
                { url: 'https://example2.com', status: UrlCheckStatus.error },
            ],
        };

        repository.findById.mockReturnValue(fixture);

        const result = service.getJob(jobId);

        expect(repository.findById).toHaveBeenCalledWith(jobId);
        expect(result).toEqual(fixture);
    });

    it('getUrlChecks должен вызывать метод репозитория и возвращать список', () => {
        const jobId: JobId = 'job-1';

        const urlChecks: UrlCheck[] = [
            {
                url: 'https://example1.com',
                status: UrlCheckStatus.pending,
            },
            {
                url: 'https://example2.com',
                status: UrlCheckStatus.success,
                httpCode: 200,
                startedAt: new Date(),
                endedAt: new Date(),
                duration: 150,
            },
        ];

        repository.getUrlChecksByJobId.mockReturnValue(urlChecks);

        const result = service.getUrlChecks(jobId);

        expect(repository.getUrlChecksByJobId).toHaveBeenCalledWith(jobId);
        expect(result).toBe(urlChecks);
        expect(result).toHaveLength(2);
    });

    it('cancelJob вызывает метод репозитория, чтобы пометить Job как cancelled', () => {
        const jobId: JobId = 'job-1';

        service.cancelJob(jobId);

        expect(repository.markCancelled).toHaveBeenCalledWith(jobId);
    });
});
