import { DateService } from '@app/services/date/date.service';
import { Message } from '@common/message';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExampleService {
    private clientMessages: Message[];

    constructor(
        private readonly dateService: DateService,
        private readonly logger: Logger,
    ) {
        this.clientMessages = [];
    }

    about(): Message {
        return {
            title: 'Basic Server About Page',
            body: 'Try calling /api/docs to get the documentation',
        };
    }

    helloWorld(): Message {
        return {
            title: 'Hello world',
            body: `Time is : ${this.dateService.currentTime()}`,
        };
    }

    storeMessage(message: Message): void {
        this.logger.log(message);
        this.clientMessages.push(message);
    }

    getAllMessages(): Message[] {
        return this.clientMessages;
    }
}
