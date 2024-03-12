import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LIMIT_MESSAGES_CHARACTERS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { of } from 'rxjs';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let chatServiceMock: Partial<SocketCommunicationService>;

    beforeEach(() => {
        chatServiceMock = {
            send: jasmine.createSpy('send').and.returnValue(of(null)),
        };

        TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            imports: [FormsModule],
            providers: [{ provide: SocketCommunicationService, useValue: chatServiceMock }],
        });

        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send message to room', () => {
        const message = 'Hello, world!';
        component.roomMessage = message;
        component.sendToRoom();
        expect(chatServiceMock.send).toHaveBeenCalledWith('roomMessage', message);
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
        const message = 'Hello, world!';
        component.roomMessages = [];
        expect(component.isSent(message)).toBeTrue();
        component.roomMessages.push(message);
        expect(component.isSent(message)).toBeFalse();
    });
});
