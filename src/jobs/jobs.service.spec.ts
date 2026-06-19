import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { JobId } from './entities/job.entity';

describe('JobsService', () => {
    let service: JobsService;
    let repository: jest.Mocked<Pick<JobsRepository, 'create'>>;

    beforeAll(async () => {
        repository = {
            create: jest.fn(),
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
});
