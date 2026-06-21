import type { UrlCheck } from '../../url-check';
import type { JobId } from './job-id';
import type { JobStatus } from './job-status';

export interface JobDetails {
    id: JobId;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    urlChecks: UrlCheck[];
}
