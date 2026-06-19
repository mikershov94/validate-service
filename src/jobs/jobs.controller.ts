import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CreateJobResponseDto } from './dto/create-job-response.dto';
import { CreateJobRequestDto } from './dto/create-job-request.dto';
import { JobsService } from './jobs.service';

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
    getJobsList() {}

    @Get(':id')
    getJobDetails() {}

    @Delete(':id')
    cancelJob() {}
}
