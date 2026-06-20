import { Test, TestingModule } from '@nestjs/testing';
import { JobsProcessor } from './jobs-processor.service';
import { JobsRepository } from '../repository/jobs.repository';
import { JobStatus } from '../consts/job-status.const';

describe('JobsProcessor', () => {
    let processor: JobsProcessor;
    let repository: jest.Mocked<Omit<JobsRepository, 'store'>>;

    beforeAll(async () => {
        repository = {
            create: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            getUrlChecksByJobId: jest.fn(),
            setStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsProcessor,
                {
                    provide: JobsRepository,
                    useValue: repository,
                },
            ],
        }).compile();

        processor = module.get<JobsProcessor>(JobsProcessor);
    });

    it('должен быть определен', () => {
        expect(processor).toBeDefined();
    });

    it('process должен завершать Job', () => {
        const jobId = 'job-1';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [],
        });

        processor.process(jobId);

        expect(repository.setStatus).toHaveBeenCalledWith(jobId, JobStatus.completed);
    });
});
