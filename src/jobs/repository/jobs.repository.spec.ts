import { Test, TestingModule } from '@nestjs/testing';
import { JobsRepository } from './jobs.repository';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckStatus } from '../consts/url-check-status.const';
import { HttpStatus } from '@nestjs/common';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';

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

    it('create должен создать Job в store и вернуть jobId', () => {
        const urls = ['https://example.com'];

        const jobId = repository.create(urls);
        expect(repository.findById(jobId).id).toBe(jobId);
    });

    it('findById должен возвращать Job если jobId передан', () => {
        const urls = ['https://example.com'];

        const jobId = repository.create(urls);
        expect(repository.findById(jobId).id).toBe(jobId);
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

    it('setStatus устанавливает в Job c jobId переданный статус', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        repository.setStatus(jobId, JobStatus.inProgress);
        let job = repository.findById(jobId);
        expect(job.status).toBe(JobStatus.inProgress);

        repository.setStatus(jobId, JobStatus.completed);
        job = repository.findById(jobId)!;
        expect(job.status).toBe(JobStatus.completed);

        repository.setStatus(jobId, JobStatus.cancelled);
        job = repository.findById(jobId)!;
        expect(job.status).toBe(JobStatus.cancelled);
    });

    it('markInProgress помечает Job in_progress и устанавливает startedAt для всех URL и возвращает startedAt', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        const startedAt = repository.markInProgress(jobId);

        const job = repository.findById(jobId);
        expect(job.status).toBe(JobStatus.inProgress);
        job.urlChecks.forEach((check) => {
            expect(check.startedAt).toBeInstanceOf(Date);
        });
        expect(startedAt).toBeInstanceOf(Date);
    });

    it('markInCancelled помечает Job cancelled', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        repository.markCancelled(jobId);

        const job = repository.findById(jobId);
        expect(job.status).toBe(JobStatus.cancelled);
        expect(job.updatedAt).not.toBe(job.createdAt);
    });

    it('markUrlCheckSuccess помечает UrlCheck как success и устанавливает статистику', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        repository.markUrlCheckSuccess(jobId, 'https://example2.com', {
            httpCode: HttpStatus.OK,
            endedAt: new Date(),
            duration: 2,
        });

        const job = repository.findById(jobId);
        job.urlChecks.forEach((check) => {
            if (check.url === 'https://example2.com') {
                expect(check.status).toBe(UrlCheckStatus.success);
                expect(check.endedAt).toBeInstanceOf(Date);
                expect(check.duration).toBeGreaterThan(0);
            }
        });
    });

    it('markUrlCheckError помечает UrlCheck как error и устанавливает errorMessage', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        repository.markUrlCheckError(jobId, 'https://example2.com', {
            httpCode: HttpStatus.NOT_FOUND,
            message: UrlCheckErrorMessage.CLIENT_ERROR,
        });

        const job = repository.findById(jobId);
        job.urlChecks.forEach((check) => {
            if (check.url === 'https://example2.com') {
                expect(check.status).toBe(UrlCheckStatus.error);
                expect(check.errorMessage).toBe(UrlCheckErrorMessage.CLIENT_ERROR);
            }
        });
    });

    it('markPendingUrlChecksCancelled помечает UrlChecks как Cancelled если стоит метка pending', () => {
        const urls = ['https://example1.com', 'https://example2.com'];
        const jobId = repository.create(urls);

        repository.markUrlCheckSuccess(jobId, 'https://example1.com', {
            httpCode: HttpStatus.OK,
            endedAt: new Date(),
            duration: 2,
        });

        repository.markPendingUrlChecksCancelled(jobId);

        const job = repository.findById(jobId);
        job.urlChecks.forEach((check) => {
            if (check.url === 'https://example1.com') {
                expect(check.status).toBe(UrlCheckStatus.success);
                expect(check.endedAt).toBeInstanceOf(Date);
                expect(check.duration).toBeGreaterThan(0);
            }

            if (check.url === 'https://example2.com') {
                expect(check.status).toBe(UrlCheckStatus.cancelled);
            }
        });
    });
});
