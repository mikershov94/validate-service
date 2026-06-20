import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { JobsProcessorService } from './processors/jobs-processor.service';

@Module({
    controllers: [JobsController],
    providers: [JobsService, JobsRepository, JobsProcessorService],
})
export class JobsModule {}
