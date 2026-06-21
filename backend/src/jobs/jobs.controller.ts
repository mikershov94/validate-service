import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateJobResponseDto } from './dto/create-job-response.dto';
import { CreateJobRequestDto } from './dto/create-job-request.dto';
import { JobsService } from './jobs.service';
import { GetJobsResponseDto } from './dto/get-jobs-response.dto';
import { GetJobDetailsDto } from './dto/get-job-details.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly service: JobsService) {}

    @Post()
    createJob(@Body() dto: CreateJobRequestDto): CreateJobResponseDto {
        const jobId = this.service.createJob(dto.urls);

        return {
            jobId,
        };
    }

    @Get()
    getJobsList(): GetJobsResponseDto[] {
        return this.service.getJobsList();
    }

    @Get(':id')
    getJobDetails(@Param('id') jobId: string): GetJobDetailsDto {
        return this.service.getJob(jobId);
    }

    @Delete(':id')
    cancelJob(@Param('id') jobId: string): void {
        this.service.cancelJob(jobId);
    }
}
