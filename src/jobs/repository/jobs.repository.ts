import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Job, JobId, UrlCheck } from '../entities/job.entity';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckStatus } from '../consts/url-check-status.const';
import { UrlCheckStats } from '../interfaces/url-check-stats.interface';
import { RepositoryErrors } from '../consts/repository-errors.const';
import { UrlCheckError } from '../interfaces/url-check-error.interface';

@Injectable()
export class JobsRepository {
    private readonly store: Map<string, Job>;

    constructor() {
        this.store = new Map();
    }

    public create(urls: string[]): JobId {
        const now = new Date();

        const urlChecks: UrlCheck[] = urls.map((url) => ({
            url,
            status: UrlCheckStatus.pending,
        }));

        const jobId: JobId = randomUUID();
        const job: Job = {
            id: jobId,
            status: JobStatus.pending,
            urlChecks,
            createdAt: now,
            updatedAt: now,
        };

        this.store.set(jobId, job);

        return jobId;
    }

    public findById(id: JobId): Job {
        const job = this.store.get(id);

        if (!job) {
            throw new Error(RepositoryErrors.JOB_NOT_FOUND);
        }

        return job;
    }

    public getList(): Job[] {
        return [...this.store.values()];
    }

    public getUrlChecksByJobId(id: JobId): UrlCheck[] {
        return this.findById(id).urlChecks;
    }

    public setStatus(id: JobId, status: JobStatus): void {
        const job = this.findById(id);

        this.store.set(id, {
            ...job,
            status,
            updatedAt: new Date(),
        });
    }

    public markInProgress(id: JobId): Date {
        const job = this.findById(id);

        const now = new Date();
        this.store.set(id, {
            ...job,
            status: JobStatus.inProgress,
            updatedAt: new Date(),
            urlChecks: job.urlChecks.map((check) => ({ ...check, startedAt: now })),
        });

        return now;
    }

    public markCancelled(id: JobId): void {
        const job = this.findById(id);

        this.store.set(id, {
            ...job,
            status: JobStatus.cancelled,
            updatedAt: new Date(),
        });
    }

    public markUrlCheckSuccess(id: JobId, url: string, stats: UrlCheckStats): void {
        const job = this.findById(id);

        this.store.set(id, {
            ...job,
            updatedAt: new Date(),
            urlChecks: job.urlChecks.map((check) => {
                if (check.url === url) {
                    return {
                        ...check,
                        status: UrlCheckStatus.success,
                        httpCode: stats.httpCode,
                        endedAt: stats.endedAt,
                        duration: stats.duration,
                    };
                }

                return check;
            }),
        });
    }

    public markUrlCheckError(id: JobId, url: string, urlCheckError: UrlCheckError): void {
        const job = this.findById(id);
        this.store.set(id, {
            ...job,
            updatedAt: new Date(),
            urlChecks: job.urlChecks.map((check) => {
                if (check.url === url) {
                    return {
                        ...check,
                        status: UrlCheckStatus.error,
                        httpCode: urlCheckError.httpCode,
                        errorMessage: urlCheckError.message,
                    };
                }
                return check;
            }),
        });
    }

    public markPendingUrlChecksCancelled(id: JobId): void {
        const job = this.findById(id);
        this.store.set(id, {
            ...job,
            updatedAt: new Date(),
            urlChecks: job.urlChecks.map((check) => {
                if (check.status === UrlCheckStatus.pending) {
                    return {
                        ...check,
                        status: UrlCheckStatus.cancelled,
                    };
                }
                return check;
            }),
        });
    }
}
