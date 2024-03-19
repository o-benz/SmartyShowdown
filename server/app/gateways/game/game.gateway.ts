import { GameClientEvents, GameEnum, GameEvents } from '@app/gateways/game/game.gateway.events';
import { Answer, Answers, Room, SocketAnswer } from '@app/model/socket/socket.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketGameManagerService } from '@app/services/socket-game-manager/socket-game-manager.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const TICK_MS = 1000;

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayDisconnect, OnModuleInit, OnGatewayInit {
    @WebSocketServer() private server: Server;

    protected rooms = new Map<string, Room>();

    constructor(
        private socketService: SocketService,
        private quizService: QuizService,
        private socketGame: SocketGameManagerService,
    ) {}

    @SubscribeMessage(GameEvents.CreateRoom)
    async createRoom(socket: Socket, quizID: string): Promise<string> {
        const room = this.quizService.generateRandomID(GameEnum.ROOMCODELENGTH);
        socket.join(room);
        this.socketService.initializeOrganizerSocket(socket, room);
        this.socketService.populateRoom(this.rooms, socket);
        this.rooms.get(room).gameStats = await this.quizService.populateGameStats(this.server, socket, quizID);
        return room;
    }

    @SubscribeMessage(GameEvents.JoinRoom)
    async joinRoomAck(socket: Socket, room: string): Promise<SocketAnswer> {
        return this.socketService.attemptJoinRoom(socket, room, this.rooms);
    }

    @SubscribeMessage(GameEvents.Login)
    async login(socket: Socket, username: string): Promise<SocketAnswer> {
        if (username) username = username.trim();
        else return { joined: false, message: GameEnum.UserNotValidMessage };
        socket.data.username = username;
        return this.socketService.attemptLogin(socket, this.rooms);
    }

    @SubscribeMessage(GameEvents.RoomMessage)
    handleRoomMessage(socket: Socket, message: string) {
        if (this.socketGame.isRoomValid(this.rooms, socket)) return;
        const room = this.rooms.get(socket.data.room);
        this.socketGame.handleRoomMessage(room, message);
        this.sendMessage(socket, message);
    }

    @SubscribeMessage(GameEvents.SendMessage)
    sendMessage(socket: Socket, message: string) {
        if (this.socketGame.isMessageValid(message)) this.server.to(socket.data.room).emit(GameEvents.SendMessage, message);
    }

    @SubscribeMessage(GameEvents.UpdateRoom)
    async updateRoom(socket: Socket) {
        return (await this.socketService.getSocketsInRoom(socket.data.room)).map((userSockets) => userSockets.data);
    }

    @SubscribeMessage(GameEvents.UpdateUsers)
    async updateUsers(socket: Socket) {
        return await this.socketService.getAllUsernamesInRoom(socket.data.room);
    }

    @SubscribeMessage(GameEvents.GetAllMessages)
    getAllMessages(socket: Socket) {
        if (this.rooms.get(socket.data.room)) return this.rooms.get(socket.data.room).roomMessages;
    }

    @SubscribeMessage(GameEvents.AddAnswer)
    addAnswer(socket: Socket, ans: Answer) {
        this.socketGame.addAnswer(socket, ans, this.rooms);
        this.getAnswers(socket, ans.questionIndex);
    }

    @SubscribeMessage(GameEvents.GetAnswers)
    getAnswers(socket: Socket, questionIndex: number) {
        const room = this.rooms.get(socket.data.room);
        if (room) this.server.to(socket.data.room).emit(GameEvents.GetAnswers, room.gameStats.questions[questionIndex]);
    }

    @SubscribeMessage(GameEvents.GetStats)
    getStats(socket: Socket) {
        const room = this.rooms.get(socket.data.room);
        if (room) return room.gameStats;
    }

    @SubscribeMessage(GameEvents.EndGame)
    endGame(socket: Socket) {
        this.rooms.get(socket.data.room).isStarted = false;
        this.server.to(socket.data.room).emit(GameClientEvents.ShowResults);
    }

    @SubscribeMessage(GameEvents.ConfirmAnswer)
    confirmAnswer(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        const socketUser = this.socketService.findSocketUser(room, socket.data.username);

        if (this.socketGame.canConfirmAnswer(socketUser)) {
            socketUser.data.answered = true;
            this.socketGame.checkAnswers(socket, parseInt(questionIndex, 10), room);
            if (this.socketGame.allAnswered(room)) this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
        }
    }

    @SubscribeMessage(GameEvents.BanUser)
    async banUser(socket: Socket, username: string) {
        this.socketService.addToBannedList(this.rooms.get(socket.data.room), username);
        const bannedSocket = await this.socketService.getBannedSocket(socket, username);
        if (bannedSocket) this.leaveRoom(bannedSocket);
    }

    @SubscribeMessage(GameEvents.GetUserInfo)
    getUserInfo(socket: Socket) {
        return socket.data;
    }

    @SubscribeMessage(GameEvents.Logout)
    leaveRoom(socket: Socket) {
        const roomCode = socket.data.room;
        const roomObj = this.rooms.get(roomCode);
        const username = socket.data.username;
        this.socketService.userLeaveRoom(roomObj, socket, username);
        if (this.socketGame.allAnswered(roomObj)) this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
        this.server.to(roomCode).emit(GameClientEvents.LeftRoom, username);
        socket.leave(roomCode);
    }

    @SubscribeMessage(GameEvents.DestroyRoom)
    destroyRoom(socket: Socket) {
        this.rooms.delete(socket.data.room);
        this.server.to(socket.data.room).emit(GameClientEvents.RoomClosed);
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    nextQuestion(socket: Socket): void {
        this.server.to(socket.data.room).emit(GameClientEvents.ChangeQuestion);
        const room = this.rooms.get(socket.data.room);
        this.socketService.resetUser(room);
    }

    @SubscribeMessage(GameEvents.RoundOver)
    roundOver(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        if (room) this.socketGame.finishQuestion(room, questionIndex);
        this.server.to(socket.data.room).emit(GameClientEvents.FinalizeAnswers);
    }

    @SubscribeMessage(GameEvents.IsAnswerValid)
    isAnswerValid(socket: Socket, answer: Answers) {
        return this.quizService.validateAnswer(socket, answer, this.rooms.get(socket.data.room).gameStats);
    }

    @SubscribeMessage(GameEvents.StartGame)
    startGame(socket: Socket): void {
        this.socketGame.startGame(this.rooms.get(socket.data.room), socket);
    }

    @SubscribeMessage(GameEvents.LockRoom)
    lockRoom(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        this.socketService.updateLockRoom(room);
    }

    @SubscribeMessage(GameEvents.UnlockRoom)
    unlockRoom(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        this.socketService.updateLockRoom(room);
    }

    async handleDisconnect(socket: Socket) {
        if (socket.data.room) {
            const room = this.rooms.get(socket.data.room);
            if (await this.socketService.destroyRoom(socket, socket.data.room, room)) this.destroyRoom(socket);
            this.leaveRoom(socket);
        }
    }

    afterInit() {
        setInterval(() => {
            this.server.emit('tick', {});
        }, TICK_MS);
    }

    onModuleInit() {
        this.socketService.setServer(this.server);
        this.socketGame.setServer(this.server);
    }
}
