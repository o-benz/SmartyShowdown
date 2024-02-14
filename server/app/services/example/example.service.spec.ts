import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from './example.service';
import { Message } from '@app/model/schema/message.schema';

describe('ExampleService', () => {
    let service: ExampleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExampleService, DateService, Logger],
        }).compile();

        service = module.get<ExampleService>(ExampleService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('about() should return the about message', () => {
        expect(service.about().title.toLowerCase()).toContain('about');
    });

    it('helloWorld() should return the hello world message', () => {
        expect(service.helloWorld().title.toLowerCase()).toContain('hello world');
    });

    it('storeMessage() should save message', () => {
        const allMessages = service.getAllMessages();
        expect(allMessages.length).toEqual(0);
        const dummyMessage1: Message = {
            title: 'Hey',
            body: 'you',
        };
        service.storeMessage(dummyMessage1);
        const allMessagesAfterFirstStore = service.getAllMessages();
        expect(allMessagesAfterFirstStore.length).toEqual(1);
        const dummyMessage2: Message = {
            title: 'Hey',
            body: 'there',
        };
        service.storeMessage(dummyMessage2);
        const allMessagesAfterSecondSave = service.getAllMessages();
        expect(allMessagesAfterSecondSave.length).toEqual(2);
        expect(allMessages.sort()).toEqual([dummyMessage1, dummyMessage2].sort());
        expect(service).toBeDefined();
    });
});
