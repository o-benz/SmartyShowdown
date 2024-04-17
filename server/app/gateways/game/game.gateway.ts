import { GameClientEvents, GameEnum, GameEvents } from '@app/gateways/game/game.gateway.events';
import { Quiz } from '@app/model/quiz/quiz.schema';
import { Answer, GameInfo, GivePointsInfo, Room, SocketAnswer } from '@app/model/socket/socket.schema';
import { PlayerState } from '@app/model/stats/stats.schema';
import { HistoricService } from '@app/services/historic-manager/historic.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketGameManagerService } from '@app/services/socket-game-manager/socket-game-manager.service';
import { SocketTimeManagerService } from '@app/services/socket-time-manager/socket-time-manager.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const QRL_INACTIVE_MS_TIMER = 5000;

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer() private server: Server;

    protected rooms = new Map<string, Room>();

    /* eslint-disable max-params */
    constructor(
        private historicService: HistoricService,
        private socketService: SocketService,
        private quizService: QuizService,
        private socketGame: SocketGameManagerService,
        private socketTimeManager: SocketTimeManagerService,
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

    @SubscribeMessage(GameEvents.CreateRoomRandom)
    async createRoomRandom(socket: Socket, quiz: Quiz): Promise<string> {
        const room = this.quizService.generateRandomID(GameEnum.ROOMCODELENGTH);
        socket.join(room);
        const gameStats = await this.quizService.populateGameStatsRandom(this.server, socket, quiz);
        this.socketService.initializeRandomOrganizerSocket(socket, room, this.rooms, gameStats);
        return room;
    }

    @SubscribeMessage(GameEvents.JoinRoom)
    async joinRoomAck(socket: Socket, room: string): Promise<SocketAnswer> {
        return this.socketService.attemptJoinRoom(socket, room, this.rooms);
    }

    @SubscribeMessage(GameEvents.Login)
    async login(socket: Socket, username: string): Promise<SocketAnswer> {
        if (!this.socketService.canJoinRoom(this.rooms, socket.data.room)) return { joined: false, message: GameEnum.ErrorMessage };
        if (username) username = username.trim();
        else return { joined: false, message: GameEnum.UserNotValidMessage };
        socket.data.username = username;
        return this.socketService.attemptLogin(socket, this.rooms);
    }

    @SubscribeMessage(GameEvents.RoomMessage)
    handleRoomMessage(socket: Socket, message: string) {
        const user = this.socketService.findSocketUser(this.rooms.get(socket.data.room), socket.data.username);
        if (!this.socketGame.isRoomValid(this.rooms, socket)) return;
        if (user && user.data.isMuted) return;
        if (!this.socketGame.isMessageValid(message)) return;
        this.sendMessage(socket, message);
    }

    @SubscribeMessage(GameEvents.SendMessage)
    sendMessage(socket: Socket, message: string) {
        const room = this.rooms.get(socket.data.room);
        this.socketGame.handleRoomMessage(room, message);
        this.server.to(socket.data.room).emit(GameEvents.SendMessage, message);
    }

    @SubscribeMessage(GameEvents.UpdateRoom)
    async updateRoom(socket: Socket) {
        return (await this.socketService.getSocketsInRoom(socket.data.room)).map((userSockets) => userSockets.data);
    }

    @SubscribeMessage(GameEvents.SendTextAnswer)
    async sendTextAnswer(socket: Socket, textAnswer: string) {
        const room = this.rooms.get(socket.data.room);
        const socketUser = this.socketService.findSocketUser(room, socket.data.username);
        socketUser.data.textAnswer = textAnswer;
    }

    @SubscribeMessage(GameEvents.GetTextAnswers)
    async getTextAnswers(socket: Socket) {
        const room = this.rooms.get(socket.data.room);
        if (room) {
            return this.socketService.getTextsFromRoom(room);
        }
    }

    @SubscribeMessage(GameEvents.UpdateUsers)
    async updateUsers(socket: Socket) {
        const users = await this.socketService.getAllUsernamesInRoom(socket.data.room);
        return users;
    }

    @SubscribeMessage(GameEvents.GetAllMessages)
    getAllMessages(socket: Socket) {
        if (this.rooms.get(socket.data.room)) return this.rooms.get(socket.data.room).roomMessages;
    }

    @SubscribeMessage(GameEvents.AddAnswer)
    addAnswer(socket: Socket, ans: Answer) {
        this.socketGame.addAnswer(socket, ans, this.rooms);
        const user = this.socketService.findSocketUser(this.rooms.get(socket.data.room), socket.data.username);
        if (user.data.state < PlayerState.FirstInteraction) this.updatePlayerState(socket, PlayerState.FirstInteraction);
        this.getAnswers(socket, ans.questionIndex);
    }

    @SubscribeMessage(GameEvents.ChangeQrlQuestion)
    changeQrlQuestion(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        const questionIndexNumber = parseInt(questionIndex, 10);
        if (room) {
            this.socketService.changeQrlStatlines(room, questionIndexNumber);
        }
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
        this.socketService.resetUser(this.rooms.get(socket.data.room));
        if (socket.data.username === 'organisateur') this.historicService.populateHistory(this.rooms.get(socket.data.room));
        this.server.to(socket.data.room).emit(GameClientEvents.ShowResults);
    }

    @SubscribeMessage(GameEvents.MakeUserActive)
    makeUserActive(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        const user = this.socketService.findSocketUser(this.rooms.get(socket.data.room), socket.data.username);
        const username = user.data.username;
        const questionIndexNumber = parseInt(questionIndex, 10);
        if (room) {
            const question = room.gameStats.questions[questionIndexNumber];
            const exists = this.socketService.findNameInStatLine(question, username, 0);
            if (!exists) {
                this.socketGame.changeUserActivityOnPress(question, username, 0, 1);
                if (user.data.state < PlayerState.FirstInteraction) this.updatePlayerState(socket, PlayerState.FirstInteraction);
                this.getAnswers(socket, questionIndexNumber);
            }
            const socketTimer = room.socketTimers;
            const existingTimer = socketTimer.get(username);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            const timer = setTimeout(() => {
                if (!this.socketService.wereStatlinesChanged(question)) {
                    this.socketGame.changeUserActivityOnPress(question, username, 1, 0);
                    this.getAnswers(socket, questionIndexNumber);
                }
                socketTimer.delete(username);
            }, QRL_INACTIVE_MS_TIMER);

            socketTimer.set(username, timer);
        }
    }

    @SubscribeMessage(GameEvents.GivePoints)
    givePoints(socket: Socket, givePointsInfo: GivePointsInfo) {
        const room = this.rooms.get(socket.data.room);
        const socketUser = this.socketService.findSocketUser(room, givePointsInfo.username);
        this.socketGame.givePoints(room, socketUser, givePointsInfo);
    }

    @SubscribeMessage(GameEvents.EndCorrection)
    endCorrection(socket: Socket, questionIndex: string) {
        const questionIndexNumber = parseInt(questionIndex, 10);
        this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
        this.getAnswers(socket, questionIndexNumber);
    }

    @SubscribeMessage(GameEvents.ConfirmAnswer)
    confirmAnswer(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        const socketUser = this.socketService.findSocketUser(room, socket.data.username);

        if (this.socketGame.canConfirmAnswer(socketUser)) {
            if (!room.gameStats.questions[questionIndex].timeFinished) this.updatePlayerState(socket, PlayerState.AnswerConfirmed);
            if (this.socketGame.getQuestionType(room, questionIndex) === 'QCM') {
                socketUser.data.answered = true;
                this.socketGame.checkAnswers(socket, parseInt(questionIndex, 10), room);
                if (this.socketGame.allAnswered(room)) this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
            } else if (this.socketGame.getQuestionType(room, questionIndex) === 'QRL') {
                socketUser.data.answered = true;
                if (this.socketGame.allAnswered(room)) this.server.to(socket.data.room).emit(GameClientEvents.CorrectQrlQuestions);
            }
        }
    }

    @SubscribeMessage(GameEvents.BanUser)
    async banUser(socket: Socket, username: string) {
        this.socketService.addToBannedList(this.rooms.get(socket.data.room), username);
        const bannedSocket = await this.socketService.getBannedSocket(socket, username);
        if (bannedSocket) this.leaveRoom(bannedSocket);
    }

    @SubscribeMessage(GameEvents.MutePlayer)
    muteUser(socket: Socket, username: string) {
        const user = this.socketService.findSocketUser(this.rooms.get(socket.data.room), username);
        if (user) {
            user.data.isMuted = !user.data.isMuted;
            this.server.to(user.data.id).emit(GameClientEvents.PlayerMuted);
        }
    }

    @SubscribeMessage(GameEvents.GetUserInfo)
    getUserInfo(socket: Socket) {
        return socket.data;
    }

    @SubscribeMessage(GameEvents.GetRandom)
    getRandom(socket: Socket) {
        const room = this.rooms.get(socket.data.room);
        return room ? room.isRandom : null;
    }

    @SubscribeMessage(GameEvents.Logout)
    leaveRoom(socket: Socket) {
        const roomCode = socket.data.room;
        const roomObj = this.rooms.get(roomCode);
        const username = socket.data.username;
        this.updatePlayerState(socket, PlayerState.PlayerLeft);
        this.socketService.userLeaveRoom(roomObj, socket, username);
        if (this.socketGame.allAnswered(roomObj)) this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
        this.server.to(roomCode).emit(GameClientEvents.LeftRoom, username);
        this.socketGame.sendPlayerLeftMessage(socket, this.rooms.get(socket.data.room));
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
        room.delayTick = 1000;
        this.socketTimeManager.setTimer(room, socket.data.room);
    }

    @SubscribeMessage(GameEvents.UpdatePlayerState)
    updatePlayerState(socket: Socket, state: PlayerState) {
        const user = this.socketService.findSocketUser(this.rooms.get(socket.data.room), socket.data.username);
        if (user) {
            user.data.state = state;
            this.server.to(socket.data.room).emit(GameClientEvents.PlayerStateChange, user);
        }
    }

    @SubscribeMessage(GameEvents.RoundOver)
    roundOver(socket: Socket, questionIndex: string) {
        const room = this.rooms.get(socket.data.room);
        if (room) this.socketGame.finishQuestion(room, questionIndex);
        if (socket.data.username === 'organisateur') this.server.to(socket.data.room).emit(GameClientEvents.FinalizeAnswers);
    }

    @SubscribeMessage(GameEvents.StartGame)
    startGame(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        if (room) room.startingTime = new Date().toISOString();

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

    @SubscribeMessage(GameEvents.PauseTimer)
    pauseTimer(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        this.socketTimeManager.pauseTimer(room, socket.data.room);
    }

    @SubscribeMessage(GameEvents.PanicMode)
    panicMode(socket: Socket, gameInfo: GameInfo) {
        const room = this.rooms.get(socket.data.room);
        const res = this.socketTimeManager.panicTimer(room, socket.data.room, gameInfo.timeLeft, gameInfo.questionIndex);
        this.server.to(socket.data.room).emit(GameClientEvents.PanicEnabled, res);
    }

    async handleDisconnect(socket: Socket) {
        if (socket.data.room) {
            const room = this.rooms.get(socket.data.room);
            if (await this.socketService.canDestroyRoom(socket, socket.data.room, room)) this.destroyRoom(socket);
            this.leaveRoom(socket);
        }
    }

    onModuleInit() {
        this.socketService.setServer(this.server);
        this.socketGame.setServer(this.server);
        this.socketTimeManager.setServer(this.server);
    }
}
