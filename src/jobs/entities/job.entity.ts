import { HttpStatus } from '@nestjs/common';
import { JobStatus } from '../consts/job-status.const';

export interface JobDetails {
    url: string;
    httpCode: HttpStatus;
    status: JobStatus;
    startedAt: Date;
    endedAt: Date;
    duration: number;
}

export interface Job {
    id: string;
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
    details: JobDetails[];
}
