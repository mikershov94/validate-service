import { Test, TestingModule } from '@nestjs/testing';
import { JobsRepository } from './jobs.repository';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckStatus } from '../consts/url-check-status.const';

describe('JobsRepository', () => {
    let repository: JobsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JobsRepository],
        }).compile();

        repository = module.get<JobsRepository>(JobsRepository);
    });

    it('должен быть инициализирован', () => {
        expect(repository).toBeDefined();
    });

    it('findById должен возвращать undefined если jobId не передан', () => {
        expect(repository.findById()).toBe(undefined);
    });

    it('create должен создать Job в store и вернуть jobId', () => {
        const urls = ['https://example.com'];

        const jobId = repository.create(urls);
        expect(repository.findById(jobId)!.id).toBe(jobId);
    });

    it('findById должен возвращать Job если jobId передан', () => {
        const urls = ['https://example.com'];

        const jobId = repository.create(urls);
        expect(repository.findById(jobId)!.id).toBe(jobId);
    });

    it('getList должен возврщаться список Jobs с информацией', () => {
        const urls_1 = ['https://example1.com'];
        const urls_2 = ['https://example2.com', 'https://example3.com'];

        const ids = [repository.create(urls_1), repository.create(urls_2)];

        const list = repository.getList();

        expect(list).toHaveLength(2);
        list.forEach((job, index) => {
            expect(job.id).toBe(ids[index]);
            expect(job.createdAt).toBeInstanceOf(Date);
            expect(job.status).toBe(JobStatus.pending);
        });
    });

    it('getUrlChecksByJobId должен возвращать информацию о проверках URL в Job', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        const urlChecks = repository.getUrlChecksByJobId(jobId);

        expect(urlChecks).toHaveLength(2);
        expect(urlChecks).toEqual([
            {
                url: urls[0],
                status: UrlCheckStatus.pending,
            },
            {
                url: urls[1],
                status: UrlCheckStatus.pending,
            },
        ]);
    });
});
