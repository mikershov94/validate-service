import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';
import { JobsProcessor } from './processors/jobs-processor.service';
import { UrlCheckerService } from './services/url-checker.service';
import { DelayService } from './services/delay.service';

@Module({
    controllers: [JobsController],
    providers: [JobsService, JobsRepository, JobsProcessor, UrlCheckerService, DelayService],
})
export class JobsModule {}
