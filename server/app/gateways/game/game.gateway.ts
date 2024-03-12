import { GameClientEvents, GameEnum, GameEvents } from '@app/gateways/game/game.gateway.events';
import { Room } from '@app/model/socket/socket.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    protected rooms = new Map<string, Room>();

    constructor(
        private socketService: SocketService,
        private quizService: QuizService,
    ) {}

    @SubscribeMessage(GameEvents.CreateRoom)
    async createRoom(socket: Socket, quizID: string) {
        const room = this.quizService.generateRandomID(GameEnum.ROOMCODELENGTH);
        socket.join(room);
        this.rooms.set(room, {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: await this.quizService.populateGameStats(this.server, socket, quizID),
            isStarted: false,
        });
        socket.data.room = room;
        socket.data.id = socket.id;
        socket.data.username = GameEnum.Organizer;
        return room;
    }

    @SubscribeMessage(GameEvents.JoinRoom)
    joinRoomAck(socket: Socket, room: string) {
        if (this.rooms.has(room) && this.rooms.get(room).isOpen) {
            socket.data.id = socket.id;
            socket.data.room = room;
            return { joined: true };
        }
        return { joined: false, message: GameEnum.ErrorMessage };
    }

    @SubscribeMessage(GameEvents.Login)
    async login(socket: Socket, username: string) {
        if (username === undefined || username === null || username === '') {
            return { joined: false, message: GameEnum.UserNotValidMessage };
        }
        const sockets = await this.socketService.getSocketsInRoom(socket.data.room, this.server);

        if (!this.socketService.isLoginValid(this.rooms, socket, username) || !this.socketService.isUserValid(username, sockets)) {
            return { joined: false, message: GameEnum.UserNotValidMessage };
        }

        if (this.rooms.has(socket.data.room) && this.rooms.get(socket.data.room).isOpen) {
            socket.data.username = username;
            socket.join(socket.data.room);
            this.rooms.get(socket.data.room).gameStats.users.push(socket.data);
            this.server.to(socket.data.room).except(socket.id).emit(GameClientEvents.JoinedRoom, socket.data);
            return { joined: true };
        }
        return { joined: false, message: GameEnum.UserNotValidMessage };
    }

    @SubscribeMessage(GameEvents.RoomMessage)
    handleRoomMessage(socket: Socket, message: string) {
        if (!socket.data.room || !this.rooms.has(socket.data.room)) {
            return;
        }
        const room = this.rooms.get(socket.data.room);
        room.roomMessages.push(message);
        this.sendMessage(socket, message);
    }

    @SubscribeMessage(GameEvents.SendMessage)
    sendMessage(socket: Socket, message: string) {
        if (message && message.trim() !== '') {
            this.server.to(socket.data.room).emit(GameEvents.SendMessage, message);
        }
    }

    @SubscribeMessage(GameEvents.UpdateRoom)
    async updateRoom(socket: Socket) {
        return (await this.socketService.getSocketsInRoom(socket.data.room, this.server)).map((userSockets) => userSockets.data);
    }

    @SubscribeMessage(GameEvents.UpdateUsers)
    async updateUsers(socket: Socket) {
        return await this.socketService.getAllUsernamesInRoom(socket.data.room, this.server);
    }

    @SubscribeMessage(GameEvents.GetAllMessages)
    getAllMessages(socket: Socket) {
        if (this.rooms.get(socket.data.room)) return this.rooms.get(socket.data.room).roomMessages;
    }

    @SubscribeMessage(GameEvents.AddAnswer)
    addAnswer(socket: Socket, answer: number, questionIndex: number) {
        const question = this.rooms.get(socket.data.room).gameStats.questions[questionIndex];
        if (question) {
            question.statLines.forEach((stats) => {
                stats.users = stats.users.filter((player) => {
                    return player !== socket.data.username;
                });
            });
            question.statLines[answer].users.push(socket.data.username);
            this.socketService.getSocketsInRoom(socket.data.room, this.server).then((users) => {
                this.server.to(users[0].data.id).emit(GameEvents.GetAnswers, questionIndex);
            });
        }
    }

    @SubscribeMessage(GameEvents.GetAnswers)
    getAnswers(socket: Socket, questionIndex: number) {
        return this.rooms.get(socket.data.room).gameStats.questions[questionIndex];
    }

    @SubscribeMessage(GameEvents.GetStats)
    getStats(socket: Socket) {
        if (this.rooms.get(socket.data.room)) {
            return this.rooms.get(socket.data.room).gameStats;
        }
    }

    @SubscribeMessage(GameEvents.EndGame)
    endGame(socket: Socket) {
        this.server.to(socket.data.room).emit(GameClientEvents.ShowResults);
    }

    @SubscribeMessage(GameEvents.ConfirmAnswer)
    confirmAnswer(socket: Socket) {
        const room = this.rooms.get(socket.data.room);
        const socketUser = room.gameStats.users.find((user) => user.data.username === socket.data.username);

        if (socketUser) {
            socketUser.data.answered = true;

            const allAnswered = room.gameStats.users.every((user) => user.data.answered);

            if (allAnswered) {
                this.server.to(socket.data.room).emit(GameClientEvents.EndRound);
            }
        }
    }

    @SubscribeMessage(GameEvents.BanUser)
    banUser(socket: Socket, username: string) {
        this.rooms.get(socket.data.room).bannedUsers.push(username.toLocaleLowerCase());
        this.socketService.getSocketsInRoom(socket.data.room, this.server).then((sockets) => {
            const socketUser = sockets.find((s) => s.data.username === username);
            if (socketUser) {
                const bannedSocket = this.server.sockets.sockets.get(socketUser.data.id);
                if (bannedSocket) this.leaveRoom(bannedSocket);
            }
        });
    }

    @SubscribeMessage(GameEvents.GetUserInfo)
    getUserInfo(socket: Socket) {
        return socket.data;
    }

    @SubscribeMessage(GameEvents.Logout)
    leaveRoom(socket: Socket) {
        const room = socket.data.room;
        const username = socket.data.username;
        this.server.to(room).emit(GameClientEvents.LeftRoom, username);
        socket.leave(room);
    }

    @SubscribeMessage(GameEvents.DestroyRoom)
    destroyRoom(socket: Socket) {
        this.rooms.delete(socket.data.room);
        this.server.to(socket.data.room).emit(GameClientEvents.RoomClosed);
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    nextQuestion(socket: Socket) {
        this.server.to(socket.data.room).emit(GameClientEvents.ChangeQuestion);
    }

    @SubscribeMessage(GameEvents.RoundOver)
    roundOver(socket: Socket) {
        this.server.to(socket.data.room).emit(GameClientEvents.FinalizeAnswers);
    }
    @SubscribeMessage(GameEvents.StartGame)
    async startGame(socket: Socket): Promise<void> {
        const room = this.rooms.get(socket.data.room);
        const sockets = (await this.socketService.getSocketsInRoom(socket.data.room, this.server)).map((userSockets) => userSockets.data);
        const numPlayers = sockets.length;

        const isOrganizer = socket.data.username === GameEnum.Organizer;

        if (room && room.isOpen && numPlayers > 1 && isOrganizer) {
            room.isStarted = true;
            this.server.to(socket.data.room).emit('gameStarted');
        } else {
            let message = 'Impossible de démarrer le jeu.';
            if (!isOrganizer) {
                message = "Seul l'organisateur peut démarrer le jeu.";
            } else if (!room || !room.isOpen || numPlayers <= 1) {
                message = 'Assurez-vous que la salle est verrouillée et non vide.';
            }
            socket.emit('gameStartResponse', {
                joined: false,
                message,
            });
        }
    }

    @SubscribeMessage(GameEvents.LockRoom)
    lockRoom(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        if (room && socket.data.username === GameEnum.Organizer) {
            room.isOpen = false;
        }
    }

    @SubscribeMessage(GameEvents.UnlockRoom)
    unlockRoom(socket: Socket): void {
        const room = this.rooms.get(socket.data.room);
        if (room && socket.data.username === GameEnum.Organizer) {
            room.isOpen = true;
        }
    }

    async handleDisconnect(socket: Socket) {
        if (socket.data.room) {
            if (
                (socket.data.username && socket.data.username.toLowerCase() === GameEnum.Organizer) ||
                (this.rooms.get(socket.data.room) && this.rooms.get(socket.data.room).isStarted && (await this.updateRoom(socket)).length <= 1)
            ) {
                this.destroyRoom(socket);
            }
            this.leaveRoom(socket);
        }
    }
}
