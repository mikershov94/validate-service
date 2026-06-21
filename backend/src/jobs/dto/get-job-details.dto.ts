import { JobStatus } from '../consts/job-status.const';
import { JobId } from '../entities/job.entity';
import { GetUrlChecksInfoDto } from './get-url-checks-info.dto';

export class GetJobDetailsDto {
    id!: JobId;
    status!: JobStatus;
    createdAt!: Date;
    updatedAt!: Date;
    urlChecks!: GetUrlChecksInfoDto[];
}
