import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { JobsProcessor } from './processors/jobs-processor.service';
import { UrlCheckerService } from './services/url-checker.service';

@Module({
    controllers: [JobsController],
    providers: [JobsService, JobsRepository, JobsProcessor, UrlCheckerService],
})
export class JobsModule {}
