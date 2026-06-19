import { Injectable } from '@nestjs/common';
import { JobsRepository } from './repository/jobs.repository';
import { JobId } from './entities/job.entity';

@Injectable()
export class JobsService {
    constructor(private readonly repository: JobsRepository) {}

    createJob(urls: string[]): JobId {
        return this.repository.create(urls);
    }
}
