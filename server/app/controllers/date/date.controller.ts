import { Controller, Get } from '@nestjs/common';
import { DateService } from '@app/services/date/date.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Message } from '@app/model/schema/message.schema';

@Controller('date')
export class DateController {
    constructor(private readonly dateService: DateService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return current time',
        type: Message,
    })
    dateInfo(): Message {
        return {
            title: 'Time',
            body: this.dateService.currentTime(),
        };
    }
}
