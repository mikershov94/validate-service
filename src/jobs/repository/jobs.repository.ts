import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Job, JobId, UrlCheck } from '../entities/job.entity';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckStatus } from '../consts/url-check-status.const';

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

    public findById(id?: string): Job | undefined {
        if (!id) {
            return undefined;
        }

        return this.store.get(id);
    }
    public update() {}
    public delete() {}
}
