import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { JobsProcessor } from './processors/jobs-processor.service';

@Module({
    controllers: [JobsController],
    providers: [JobsService, JobsRepository, JobsProcessor],
})
export class JobsModule {}
