import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { User } from '@app/interfaces/socket-model';
import { LIMIT_MESSAGES_CHARACTERS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewInit, OnInit {
    @ViewChildren('messageList', { read: ElementRef }) messageList: QueryList<ElementRef>;
    roomMessages: string[] = [];
    roomMessage = '';
    isMessageTooLong: boolean = false;
    limitMessagesCharacters = LIMIT_MESSAGES_CHARACTERS;
    errorMessage: string = `Le message ne doit pas excéder ${LIMIT_MESSAGES_CHARACTERS} caractères`;
    protected user: User;

    constructor(private chatService: SocketCommunicationService) {}

    get isInputDisabled(): boolean {
        return this.roomMessage.length >= LIMIT_MESSAGES_CHARACTERS;
    }

    ngOnInit(): void {
        this.receiveMessage();
        this.getAllMessages();
        this.getUserInfo();
        this.chatService.onPlayerMuted(() => {
            this.user.isMuted = !this.user.isMuted;
            if (this.roomMessages) this.roomMessages.push(this.user.isMuted ? 'vous etes muet' : 'vous pouvez parler');
        });
    }

    getUserInfo(): void {
        this.chatService.getUser().subscribe((user: User) => {
            this.user = user;
            const username = this.user.username;
            this.user.username = username.charAt(0).toUpperCase() + username.slice(1);
        });
    }

    getAllMessages(): void {
        this.chatService.getAllMessages().subscribe((messages: string[]) => {
            this.roomMessages = messages;
        });
    }

    shouldDisableButton(): boolean {
        return this.isMessageTooLong || (this.user.isMuted ?? false);
    }

    scrollToBottomAfterViewChecked(): void {
        this.messageList.last.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    handleKeydown(event: KeyboardEvent): void {
        this.limitMessageLength();
        const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        if (numberKeys.includes(event.key)) {
            event.stopPropagation();
        }
        if (event.key === 'Enter') {
            event.stopPropagation();
            this.sendToRoom();
        }
    }

    scrollToBottom(): void {
        this.messageList.changes.subscribe(() => {
            this.scrollToBottomAfterViewChecked();
        });
    }

    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    sendToRoom(): void {
        const currentDate = new Date();
        if (this.roomMessage.trim() === '') return;
        this.roomMessage = `[${currentDate.getHours()}h:${currentDate.getMinutes()}min ${this.user.username}]: ${this.roomMessage}`;
        this.chatService.send('roomMessage', this.roomMessage);
        this.roomMessage = '';
    }

    receiveMessage(): void {
        this.chatService.onMessageReceived((onmessage) => {
            this.roomMessages.push(onmessage);
        });
    }

    limitMessageLength(): void {
        this.isMessageTooLong = this.roomMessage.length >= LIMIT_MESSAGES_CHARACTERS;
        if (this.isMessageTooLong) {
            this.roomMessage = this.roomMessage.slice(0, LIMIT_MESSAGES_CHARACTERS);
        }
    }

    isSent(message: string): boolean {
        return message.split(' ').includes(this.user.username + ']:');
    }
}
