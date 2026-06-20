import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { Job, JobId, UrlCheck } from './entities/job.entity';
import { JobStatus } from './consts/job-status.const';
import { UrlCheckStatus } from './consts/url-check-status.const';

describe('JobsService', () => {
    let service: JobsService;
    let repository: jest.Mocked<Omit<JobsRepository, 'delete'>>;

    beforeAll(async () => {
        repository = {
            create: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            getUrlChecksByJobId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                {
                    provide: JobsRepository,
                    useValue: repository,
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

    it('getJobList должен вызывать метод репозитория и возврвщать список', () => {
        const now = new Date();

        const jobs: Job[] = [
            {
                id: 'job-1',
                status: JobStatus.pending,
                createdAt: now,
                updatedAt: now,
                urlChecks: [],
            },
            {
                id: 'job-2',
                status: JobStatus.completed,
                createdAt: now,
                updatedAt: now,
                urlChecks: [],
            },
        ];

        repository.getList.mockReturnValue(jobs);

        const result = service.getJobList();

        expect(repository.getList).toHaveBeenCalled();
        expect(result).toBe(jobs);
        expect(result).toHaveLength(2);
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
});
