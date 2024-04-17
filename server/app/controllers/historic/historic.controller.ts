import { HistoricGame } from '@app/model/historic/historic.interface';
import { HistoricService } from '@app/services/historic-manager/historic.service';
import { Controller, Delete, Get, Logger, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Historic')
@Controller('historic')
export class HistoricController {
    private readonly logger = new Logger(HistoricController.name);

    constructor(private readonly historicService: HistoricService) {}

    @Get()
    async findAll(@Query('sortBy') sortBy: string = 'date', @Query('sortOrder') sortOrder: string = 'asc'): Promise<HistoricGame[]> {
        this.logger.log('Getting all historic games');
        return this.historicService.findAll(sortBy, sortOrder);
    }

    @Delete('reset')
    async reset(): Promise<void> {
        this.logger.warn('Resetting all historic games data');
        return this.historicService.reset();
    }
}
