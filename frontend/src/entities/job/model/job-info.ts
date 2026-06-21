import type { JobId } from './job-id';
import type { JobStatus } from './job-status';

export interface JobInfo {
    id: JobId;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    urlCount: number;
    successCount: number;
    errorCount: number;
}
