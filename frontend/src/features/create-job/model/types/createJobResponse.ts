import type { JobId } from '@entities/job/model/job-id';

export interface CreateJobResponse {
    jobId: JobId;
}
