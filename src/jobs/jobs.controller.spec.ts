import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
    let controller: JobsController;
    let service: jest.Mocked<Pick<JobsService, 'createJob'>>;

    beforeAll(async () => {
        service = {
            createJob: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [JobsController],
            providers: [
                {
                    provide: JobsService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<JobsController>(JobsController);
    });

    it('должен быть определен', () => {
        expect(controller).toBeDefined();
    });

    it('createJob должен вызвать метод сервиса createJob', () => {
        const dto = {
            urls: ['https://example.com'],
        };

        controller.createJob(dto);

        expect(service.createJob).toHaveBeenCalled();
    });
});
