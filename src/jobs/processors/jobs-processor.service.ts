import { Injectable } from '@nestjs/common';
import { JobsRepository } from '../repository/jobs.repository';
import { JobId } from '../entities/job.entity';
import { JobStatus } from '../consts/job-status.const';

@Injectable()
export class JobsProcessor {
    constructor(private readonly repository: JobsRepository) {}

    public process(jobId: JobId): void {
        const job = this.repository.findById(jobId);

        if (!job) {
            return;
        }

        this.repository.setStatus(job.id, JobStatus.completed);
    }
}
