import { JobStatus } from '../consts/job-status.const';
import { JobId } from '../entities/job.entity';

export class GetJobsResponseDto {
    id!: JobId;
    status!: JobStatus;
    createdAt!: Date;
    updatedAt!: Date;
    urlCount!: number;
    successCount!: number;
    errorCount!: number;
}
