import { Test, TestingModule } from '@nestjs/testing';
import { JobsProcessor } from './jobs-processor.service';
import { JobsRepository } from '../repository/jobs.repository';
import { JobStatus } from '../consts/job-status.const';
import { Job, JobId, UrlCheck } from '../entities/job.entity';
import { UrlCheckStatus } from '../consts/url-check-status.const';
import { UrlCheckerService } from '../services/url-checker.service';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';
import { DelayService } from '../services/delay.service';

describe('JobsProcessor', () => {
    let processor: JobsProcessor;
    let repository: jest.Mocked<Omit<JobsRepository, 'store'>>;
    let urlChecker: jest.Mocked<UrlCheckerService>;
    let delayService: jest.Mocked<DelayService>;

    beforeEach(async () => {
        repository = {
            create: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            getUrlChecksByJobId: jest.fn(),
            setStatus: jest.fn(),
            markInProgress: jest.fn(),
            markUrlCheckSuccess: jest.fn(),
            markUrlCheckError: jest.fn(),
            markPendingUrlChecksCancelled: jest.fn(),
        };

        urlChecker = {
            check: jest.fn(),
        };

        delayService = {
            wait: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsProcessor,
                {
                    provide: JobsRepository,
                    useValue: repository,
                },
                {
                    provide: UrlCheckerService,
                    useValue: urlChecker,
                },
                {
                    provide: DelayService,
                    useValue: delayService,
                },
            ],
        }).compile();

        processor = module.get<JobsProcessor>(JobsProcessor);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('должен быть определен', () => {
        expect(processor).toBeDefined();
    });

    it('process должен переводить Job в inProgress перед выполнением запросов', async () => {
        const jobId = 'job-1';
        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [],
        });

        await processor.process(jobId);

        expect(repository.markInProgress).toHaveBeenCalledWith(jobId);
    });

    it('process должен выполнять HEAD-запрос для каждого URL', async () => {
        const jobId: JobId = 'job-1';
        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url: 'https://example1.com',
                    status: UrlCheckStatus.pending,
                },
                {
                    url: 'https://example2.com',
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        repository.markInProgress.mockReturnValue(new Date());
        urlChecker.check.mockResolvedValue(200);

        await processor.process(jobId);

        expect(urlChecker.check).toHaveBeenCalledTimes(2);
        expect(urlChecker.check).toHaveBeenNthCalledWith(1, 'https://example1.com');
        expect(urlChecker.check).toHaveBeenNthCalledWith(2, 'https://example2.com');
    });

    it('process должен помечать sucсess UrlCheck после успешного HEAD-запроса и устанавливать статистику', async () => {
        const jobId: JobId = 'job-1';
        const url = 'https://example1.com';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url,
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        repository.markInProgress.mockReturnValue(new Date());
        urlChecker.check.mockResolvedValue(200);

        await processor.process(jobId);

        expect(repository.markUrlCheckSuccess).toHaveBeenCalledTimes(1);
        expect(repository.markUrlCheckSuccess).toHaveBeenCalledWith(jobId, url, expect.any(Object));

        const result = repository.markUrlCheckSuccess.mock.calls[0][2];

        expect(result.httpCode).toBe(200);
        expect(result.endedAt).toBeInstanceOf(Date);
        expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('process должен помечать failed UrlCheck при неуспешных HTTP-кодах и устанавливать errorMessage', async () => {
        const jobId: JobId = 'job-1';
        const url = 'https://example1.com';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url,
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        repository.markInProgress.mockReturnValue(new Date());
        urlChecker.check.mockResolvedValue(404);

        await processor.process(jobId);

        expect(repository.markUrlCheckError).toHaveBeenCalledTimes(1);
        expect(repository.markUrlCheckError).toHaveBeenCalledWith(jobId, url, expect.any(Object));

        const result = repository.markUrlCheckError.mock.calls[0][2];

        expect(result.httpCode).toBe(404);
        expect(result.message).toBe(UrlCheckErrorMessage.CLIENT_ERROR);
    });

    it('process должен помечать failed UrlCheck при ошибках сети и устанавливать errorMessage', async () => {
        const jobId: JobId = 'job-1';
        const url = 'https://example1.com';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url,
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        repository.markInProgress.mockReturnValue(new Date());
        urlChecker.check.mockRejectedValue('error');

        await processor.process(jobId);

        expect(repository.markUrlCheckError).toHaveBeenCalledTimes(1);
        expect(repository.markUrlCheckError).toHaveBeenCalledWith(jobId, url, expect.any(Object));

        const result = repository.markUrlCheckError.mock.calls[0][2];

        expect(result.message).toBe(UrlCheckErrorMessage.DEFAULT);
    });

    it('process должен завершать Job', async () => {
        const jobId = 'job-1';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [],
        });

        await processor.process(jobId);

        expect(repository.setStatus).toHaveBeenCalledWith(jobId, JobStatus.completed);
    });

    it('process не должен обрабатывать URL, если Job уже cancelled', async () => {
        const jobId: JobId = 'job-1';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.cancelled,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url: 'https://example1.com',
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        await processor.process(jobId);

        expect(urlChecker.check).not.toHaveBeenCalled();
        expect(repository.markInProgress).not.toHaveBeenCalled();
        expect(repository.markUrlCheckSuccess).not.toHaveBeenCalled();
        expect(repository.markUrlCheckError).not.toHaveBeenCalled();
        expect(repository.setStatus).not.toHaveBeenCalledWith(jobId, JobStatus.completed);
    });

    it('process должен прекращать обработку не начатых URL, если Job была отменена во время обработки', async () => {
        const jobId: JobId = 'job-1';

        const urlChecks: UrlCheck[] = Array.from({ length: 6 }, (_, index) => ({
            url: `https://example${index + 1}.com`,
            status: UrlCheckStatus.pending,
        }));

        const activeJob: Job = {
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks,
        };

        const cancelledJob: Job = {
            ...activeJob,
            status: JobStatus.cancelled,
        };

        repository.findById
            .mockReturnValueOnce(activeJob)
            .mockReturnValueOnce(activeJob)
            .mockReturnValueOnce(cancelledJob);

        repository.markInProgress.mockReturnValue(new Date());

        urlChecker.check.mockResolvedValue(200);
        delayService.wait.mockResolvedValue(undefined);

        await processor.process(jobId);

        expect(urlChecker.check).toHaveBeenCalledTimes(5);
        expect(urlChecker.check).toHaveBeenCalledWith('https://example1.com');
        expect(urlChecker.check).toHaveBeenCalledWith('https://example5.com');
        expect(urlChecker.check).not.toHaveBeenCalledWith('https://example6.com');

        expect(repository.markUrlCheckSuccess).toHaveBeenCalledTimes(5);
        expect(repository.markPendingUrlChecksCancelled).toHaveBeenCalledWith(jobId);
        expect(repository.setStatus).not.toHaveBeenCalledWith(jobId, JobStatus.completed);
    });

    it('process должен выполнять задержку перед сохранением успешного результата', async () => {
        const jobId: JobId = 'job-1';
        const url = 'https://example.com';

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks: [
                {
                    url,
                    status: UrlCheckStatus.pending,
                },
            ],
        });

        repository.markInProgress.mockReturnValue(new Date());

        urlChecker.check.mockResolvedValue(200);
        delayService.wait.mockResolvedValue(undefined);

        await processor.process(jobId);

        expect(urlChecker.check).toHaveBeenCalledWith(url);

        expect(delayService.wait).toHaveBeenCalledTimes(1);

        expect(repository.markUrlCheckSuccess).toHaveBeenCalledTimes(1);
    });

    it('process должен выполнять не более 5 HEAD-запросов одновременно', async () => {
        const jobId: JobId = 'job-1';

        const urlChecks: UrlCheck[] = Array.from({ length: 10 }, (_, index) => ({
            url: `https://example${index + 1}.com`,
            status: UrlCheckStatus.pending,
        }));

        repository.findById.mockReturnValue({
            id: jobId,
            status: JobStatus.pending,
            createdAt: new Date(),
            updatedAt: new Date(),
            urlChecks,
        });

        repository.markInProgress.mockReturnValue(new Date());
        delayService.wait.mockResolvedValue(undefined);

        let activeRequests = 0;
        let maxActiveRequests = 0;

        urlChecker.check.mockImplementation(async () => {
            activeRequests += 1;

            maxActiveRequests = Math.max(maxActiveRequests, activeRequests);

            await new Promise<void>((resolve) => {
                setTimeout(resolve, 10);
            });

            activeRequests -= 1;

            return 200;
        });

        await processor.process(jobId);

        expect(urlChecker.check).toHaveBeenCalledTimes(10);
        expect(maxActiveRequests).toBeGreaterThan(1);
        expect(maxActiveRequests).toBeLessThanOrEqual(5);
    });
});
