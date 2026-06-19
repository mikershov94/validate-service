import { Test, TestingModule } from '@nestjs/testing';
import { JobsRepositoryService } from './jobs.repository';

describe('JobsRepositoryService', () => {
    let service: JobsRepositoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JobsRepositoryService],
        }).compile();

        service = module.get<JobsRepositoryService>(JobsRepositoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
