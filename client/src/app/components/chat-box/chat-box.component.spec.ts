import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LIMIT_MESSAGES_CHARACTERS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { of } from 'rxjs';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let chatServiceMock: jasmine.SpyObj<SocketCommunicationService>;

    beforeEach(() => {
        chatServiceMock = {
            send: jasmine.createSpy('send').and.returnValue(of(null)),
            onMessageReceived: jasmine.createSpy('onMessageReceived').and.callFake((callback) => callback(null)),
            getUser: jasmine.createSpy('getUser').and.returnValue(of({ username: 'testUser' })),
            getAllMessages: jasmine.createSpy('getAllMessages').and.returnValue(of(null)),
        } as jasmine.SpyObj<SocketCommunicationService>;

        TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            imports: [FormsModule],
            providers: [{ provide: SocketCommunicationService, useValue: chatServiceMock }],
        });

        chatServiceMock = TestBed.inject(SocketCommunicationService) as jasmine.SpyObj<SocketCommunicationService>;
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get user info and capitalize username', () => {
        const user = { username: 'testuser', answered: false };

        chatServiceMock.getUser.and.returnValue(of(user));
        component.getUserInfo();
        expect(component['user'].username).toEqual('Testuser');
    });

    it('should get all messages', () => {
        const messages = ['message1', 'message2'];
        chatServiceMock.getAllMessages.and.returnValue(of(messages));
        component.getAllMessages();
        expect(component.roomMessages).toEqual(messages);
    });

    it('should disable button when message is too long', () => {
        component.roomMessage = new Array(component.limitMessagesCharacters + 1).join('a');
        component.limitMessageLength();
        expect(component.isMessageTooLong).toBeTrue();
    });

    it('should not disable button when message is within limit', () => {
        component.roomMessage = 'Short message';
        expect(component.shouldDisableButton()).toBeFalse();
    });

    it('should handle keydown event properly', () => {
        const eventEnter = new KeyboardEvent('keydown', { key: 'Enter' });
        const eventNumber = new KeyboardEvent('keydown', { key: '1' });
        spyOn(eventEnter, 'stopPropagation');
        spyOn(eventNumber, 'stopPropagation');
        component.handleKeydown(eventEnter);
        expect(eventEnter.stopPropagation).toHaveBeenCalled();
        component.handleKeydown(eventNumber);
        expect(eventNumber.stopPropagation).toHaveBeenCalled();
        expect(chatServiceMock.send).not.toHaveBeenCalled();
    });

    it('should scroll to bottom when message list changes', () => {
        component.roomMessages = [];
        spyOn(component, 'scrollToBottomAfterViewChecked');
        component.roomMessages.push('new message');
        fixture.detectChanges();
        expect(component.scrollToBottomAfterViewChecked).toHaveBeenCalled();
    });

    it('should receive message and add it to room messages', () => {
        component.roomMessages = [];
        chatServiceMock.onMessageReceived.and.callFake((callback) => {
            callback('new message');
        });
        component.receiveMessage();
        expect(component.roomMessages).toContain('new message');
    });

    it('should send message to room', () => {
        const message = 'Hello, world!';
        const currentDate = new Date();
        const prefixedMessage = `[${currentDate.getHours()}h:${currentDate.getMinutes()}min TestUser]: ${message}`;
        component.roomMessage = message;
        component.sendToRoom();
        expect(chatServiceMock.send).toHaveBeenCalledWith('roomMessage', prefixedMessage);
        expect(component.roomMessage).toBe('');
    });

    it('should limit message length', () => {
        const longMessage = 'a'.repeat(LIMIT_MESSAGES_CHARACTERS + LIMIT_MESSAGES_CHARACTERS);
        component.roomMessage = longMessage;
        component.limitMessageLength();
        expect(component.roomMessage.length).toEqual(LIMIT_MESSAGES_CHARACTERS);
        expect(component.isMessageTooLong).toBeTrue();
    });

    it('should check if message is sent', () => {
        const message = '[0h:47min TestUser]: Hello, world!';
        component.roomMessages = [];
        component.roomMessages.push(message);
        expect(component.isSent(message)).toBeTrue();
    });
});
