import { mockHistoricGameData } from '@app/model/historic/mock-historic.interface';
import { HistoricService } from '@app/services/historic-manager/historic.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoricController } from './historic.controller';

describe('HistoricController', () => {
    let controller: HistoricController;
    let service: HistoricService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoricController],
            providers: [
                {
                    provide: HistoricService,
                    useValue: {
                        findAll: jest.fn(),
                        reset: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<HistoricController>(HistoricController);
        service = module.get<HistoricService>(HistoricService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all historic games', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValue(mockHistoricGameData);

            const result = await controller.findAll();

            expect(result).toEqual(mockHistoricGameData);
        });
    });

    describe('reset', () => {
        it('should reset all historic games data', async () => {
            await controller.reset();

            expect(service.reset).toHaveBeenCalled();
        });
    });
});
