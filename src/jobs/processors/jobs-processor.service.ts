import { Injectable } from '@nestjs/common';
import { JobsRepository } from '../repository/jobs.repository';
import { JobId, UrlCheck } from '../entities/job.entity';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckerService } from '../services/url-checker.service';
import { isFailedCode } from '../helpers/is-failed-code.helper';
import { generateHttpError } from '../helpers/generate-http-error.helper';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';
import { DelayService } from '../services/delay.service';

@Injectable()
export class JobsProcessor {
    private readonly batchSize: number = 5;

    constructor(
        private readonly repository: JobsRepository,
        private readonly urlChecker: UrlCheckerService,
        private readonly delayService: DelayService,
    ) {}

    public async process(jobId: JobId): Promise<void> {
        const job = this.repository.findById(jobId);

        if (job.status === JobStatus.cancelled) {
            this.repository.markPendingUrlChecksCancelled(job.id);

            return;
        }

        this.repository.markInProgress(job.id);

        for (let i = 0; i < job.urlChecks.length; i += this.batchSize) {
            const currentJob = this.repository.findById(jobId);

            if (currentJob.status === JobStatus.cancelled) {
                this.repository.markPendingUrlChecksCancelled(jobId);
                return;
            }

            const batch = job.urlChecks.slice(i, i + this.batchSize);

            await Promise.all(
                batch.map((check) => {
                    return this.processUrl(job.id, check, new Date());
                }),
            );
        }

        this.repository.setStatus(job.id, JobStatus.completed);
    }

    private async processUrl(jobId: JobId, urlCheck: UrlCheck, startedAt: Date): Promise<void> {
        const url = urlCheck.url;

        try {
            const httpCode = await this.urlChecker.check(url);

            if (isFailedCode(httpCode)) {
                const errorMessage = generateHttpError(httpCode);

                this.repository.markUrlCheckError(jobId, url, {
                    httpCode,
                    message: errorMessage!,
                });

                return;
            }

            const now = new Date();
            const duration = now.getTime() - startedAt.getTime();

            await this.delayService.wait();

            this.repository.markUrlCheckSuccess(jobId, url, {
                httpCode,
                endedAt: now,
                duration,
            });
        } catch {
            this.repository.markUrlCheckError(jobId, url, {
                message: UrlCheckErrorMessage.DEFAULT,
            });
        }
    }
}
