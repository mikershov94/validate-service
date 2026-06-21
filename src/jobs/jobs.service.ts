import { Injectable } from '@nestjs/common';
import { JobsRepository } from './repository/jobs.repository';
import { Job, JobId, UrlCheck } from './entities/job.entity';
import { JobInfo } from './interfaces/job-info.interface';
import { UrlCheckStatus } from './consts/url-check-status.const';
import { JobsProcessor } from './processors/jobs-processor.service';

@Injectable()
export class JobsService {
    constructor(
        private readonly repository: JobsRepository,
        private readonly processor: JobsProcessor,
    ) {}

    createJob(urls: string[]): JobId {
        const jobId = this.repository.create(urls);

        void this.processor.process(jobId);

        return jobId;
    }

    getJobsList(): JobInfo[] {
        const jobs = this.repository.getList();

        return jobs.map((job) => {
            const successCount = job.urlChecks.reduce(
                (acc, urlInfo) => (urlInfo.status === UrlCheckStatus.success ? (acc += 1) : acc),
                0,
            );

            const errorCount = job.urlChecks.reduce(
                (acc, urlInfo) => (urlInfo.status === UrlCheckStatus.error ? (acc += 1) : acc),
                0,
            );

            return {
                id: job.id,
                status: job.status,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
                urlCount: job.urlChecks.length,
                successCount,
                errorCount,
            };
        });
    }

    getJob(id: JobId): Job {
        return this.repository.findById(id);
    }

    getUrlChecks(jobId: string): UrlCheck[] {
        return this.repository.getUrlChecksByJobId(jobId);
    }

    cancelJob(id: JobId): void {
        this.repository.markCancelled(id);
    }
}
