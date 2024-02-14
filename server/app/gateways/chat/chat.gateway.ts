import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word?.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(ChatEvents.ValidateACK)
    validateWithAck(_: Socket, word: string) {
        return { isValid: word?.length > WORD_MIN_LENGTH };
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket) {
        socket.join(this.room);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: string) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(ChatEvents.RoomMessage, `${socket.id} : ${message}`);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        // message initial
        socket.emit(ChatEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
