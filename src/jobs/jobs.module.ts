import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './repository/jobs.repository';

@Module({
    controllers: [JobsController],
    providers: [JobsService, JobsRepository],
})
export class JobsModule {}
