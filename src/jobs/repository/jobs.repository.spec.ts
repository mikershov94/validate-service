import { Test, TestingModule } from '@nestjs/testing';
import { JobsRepository } from './jobs.repository';

describe('JobsRepository', () => {
    let service: JobsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JobsRepository],
        }).compile();

        service = module.get<JobsRepository>(JobsRepository);
    });

    it('должен быть инициализирован', () => {
        expect(service).toBeDefined();
    });

    it('findById должен возвращать undefined если jobId не передан', () => {
        expect(service.findById()).toBe(undefined);
    });

    it('create должен создать Job в store и вернуть jobId', () => {
        const urls = ['https://example.com'];

        const jobId = service.create(urls);
        expect(service.findById(jobId)!.id).toBe(jobId);
    });

    it('findById должен возвращать Job если jobId передан', () => {
        const urls = ['https://example.com'];

        const jobId = service.create(urls);
        expect(service.findById(jobId)!.id).toBe(jobId);
    });
});
