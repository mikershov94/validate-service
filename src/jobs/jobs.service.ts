import { Injectable } from '@nestjs/common';
import { JobsRepository } from './repository/jobs.repository';
import { Job, JobId, UrlCheck } from './entities/job.entity';

@Injectable()
export class JobsService {
    constructor(private readonly repository: JobsRepository) {}

    createJob(urls: string[]): JobId {
        return this.repository.create(urls);
    }

    getJobList(): Job[] {
        return this.repository.getList();
    }

    getUrlChecks(jobId: string): UrlCheck[] {
        return this.repository.getUrlChecksByJobId(jobId);
    }
}
