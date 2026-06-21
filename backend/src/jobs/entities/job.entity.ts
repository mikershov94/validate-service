import { HttpStatus } from '@nestjs/common';
import { JobStatus } from '../consts/job-status.const';
import { UrlCheckStatus } from '../consts/url-check-status.const';

export type JobId = string;

export interface UrlCheck {
    url: string;
    status: UrlCheckStatus;
    httpCode?: HttpStatus;
    errorMessage?: string;
    startedAt?: Date;
    endedAt?: Date;
    duration?: number;
}

export interface Job {
    id: JobId;
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
    urlChecks: UrlCheck[];
}
