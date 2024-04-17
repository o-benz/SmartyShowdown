import { GameClientEvents, GameEnum } from '@app/gateways/game/game.gateway.events';
import { Room, SocketAnswer, UserSocket } from '@app/model/socket/socket.schema';
import { GameStats, PlayerState, QuestionStats } from '@app/model/stats/stats.schema';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

const DEFAULT_DELAY = 1000;

@Injectable()
export class SocketService {
    private server: Server;

    setServer(server: Server): void {
        this.server = server;
    }

    isUserValid(username: string, users: UserSocket[]): boolean {
        const isNotEmpty = username && username.trim().length > 0;
        return isNotEmpty && this.isNotOrganizer(username) && this.isUniqueUsername(username, users);
    }

    isUniqueUsername(username: string, users: UserSocket[]): boolean {
        return !users.find((user) => {
            if (user.data.username) return user.data.username.toLowerCase() === username.toLowerCase();
        });
    }

    isNotOrganizer(username: string): boolean {
        return username.toLowerCase() !== GameEnum.Organizer;
    }

    async getSocketsInRoom(room: string): Promise<UserSocket[]> {
        const sockets = await this.server.in(room).fetchSockets();
        return sockets;
    }

    async getAllUsernamesInRoom(room: string): Promise<string[]> {
        const sockets = await this.getSocketsInRoom(room);
        return Array.from(sockets).map((socket) => socket.data.username);
    }

    async getAllMessages(room: Room): Promise<string[]> {
        return room.roomMessages;
    }

    addMessageToRoom(room: Room, message: string): void {
        room.roomMessages.push(message);
    }

    isLoginValid(rooms: Map<string, Room>, socket: Socket, username: string): boolean {
        return (
            rooms.has(socket.data.room) && rooms.get(socket.data.room) && !rooms.get(socket.data.room).bannedUsers.includes(username.toLowerCase())
        );
    }

    populateRoom(rooms: Map<string, Room>, socket: Socket): void {
        rooms.set(socket.data.room, {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: undefined,
            isStarted: false,
            delayTick: 1000,
            timer: setInterval(() => {
                this.server.to(socket.data.room).emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            isPaused: false,
            startingTime: '',
            isRandom: false,
            socketTimers: new Map(),
        });
    }

    populateRandomRoom(rooms: Map<string, Room>, socket: Socket): void {
        rooms.set(socket.data.room, {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: undefined,
            isStarted: false,
            delayTick: 1000,
            timer: setInterval(() => {
                this.server.to(socket.data.room).emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            isPaused: false,
            startingTime: '',
            isRandom: true,
            socketTimers: new Map(),
        });
    }

    initializeOrganizerSocket(socket: Socket, room: string): void {
        socket.data.room = room;
        socket.data.id = socket.id;
        socket.data.username = GameEnum.Organizer;
    }

    // eslint-disable-next-line max-params
    initializeRandomOrganizerSocket(socket: Socket, room: string, rooms: Map<string, Room>, gameStats: GameStats): void {
        const organizerUserSocket = this.populateUserSocket(socket.id, GameEnum.Organizer, room);
        socket.data = { ...organizerUserSocket.data };
        this.populateRandomRoom(rooms, socket);
        rooms.get(room).gameStats = gameStats;
        rooms.get(room).gameStats.users.push(organizerUserSocket);
    }

    canJoinRoom(rooms: Map<string, Room>, room: string): boolean {
        return rooms.has(room) && rooms.get(room).isOpen;
    }

    attemptJoinRoom(socket: Socket, room: string, rooms: Map<string, Room>): SocketAnswer {
        if (this.canJoinRoom(rooms, room)) {
            socket.data.id = socket.id;
            socket.data.room = room;
            return { joined: true };
        }
        return { joined: false, message: GameEnum.ErrorMessage };
    }

    async isUserInfoValid(socket: Socket, rooms: Map<string, Room>): Promise<boolean> {
        const sockets = await this.getSocketsInRoom(socket.data.room);
        const username = socket.data.username;

        if (!this.isLoginValid(rooms, socket, username) || !this.isUserValid(username, sockets)) return false;
        return true;
    }

    populateUserSocket(id: string, username: string, room: string): UserSocket {
        const socket: UserSocket = {
            data: {
                id,
                username,
                room,
                score: 0,
                bonus: 0,
                answered: false,
                firstToAnswer: false,
                hasLeft: false,
                state: PlayerState.NoInteraction,
                isMuted: false,
            },
        };
        return socket;
    }

    confirmLoggedIn(socket: Socket, rooms: Map<string, Room>): boolean {
        const room = socket.data.room;
        if (this.canJoinRoom(rooms, room)) {
            socket.join(socket.data.room);

            const user = this.populateUserSocket(socket.id, socket.data.username, room);
            socket.data = user.data;
            rooms.get(room).gameStats.users.push(user);
            this.server.to(room).except(socket.id).emit(GameClientEvents.JoinedRoom, socket.data);
            return true;
        }
        return false;
    }

    async attemptLogin(socket: Socket, rooms: Map<string, Room>): Promise<SocketAnswer> {
        const username = socket.data.username;
        if (!username) return { joined: false, message: GameEnum.UserNotValidMessage };
        if (!(await this.isUserInfoValid(socket, rooms))) return { joined: false, message: GameEnum.UserNotValidMessage };
        if (this.confirmLoggedIn(socket, rooms)) return { joined: true };
        else return { joined: false, message: GameEnum.UserNotValidMessage };
    }

    findSocketUser(room: Room, username: string): UserSocket {
        if (room) return room.gameStats.users.find((user) => user.data.username === username);
    }

    addToBannedList(room: Room, username: string): void {
        room.bannedUsers.push(username.toLocaleLowerCase());
    }

    async getBannedSocket(socket: Socket, username: string): Promise<Socket> {
        const sockets = await this.getSocketsInRoom(socket.data.room);
        const socketUser = sockets.find((s) => s.data.username === username);
        if (socketUser) {
            const bannedSocket = this.server.sockets.sockets.get(socketUser.data.id);
            if (bannedSocket) return bannedSocket;
        }
        return null;
    }

    userLeaveRoom(roomObj: Room, socket: Socket, username: string): void {
        if (roomObj && roomObj.isStarted) {
            const user = roomObj.gameStats.users.find((u) => u.data.username === socket.data.username);
            if (user) user.data.hasLeft = true;
        } else if (roomObj) roomObj.gameStats.users = roomObj.gameStats.users.filter((user) => user.data.username !== username);
    }

    resetUser(room: Room): void {
        room?.gameStats.users.forEach((user) => {
            user.data.firstToAnswer = false;
            user.data.answered = false;
            if (user.data.state !== PlayerState.PlayerLeft) user.data.state = PlayerState.NoInteraction;
        });
    }

    updateLockRoom(room: Room): void {
        room.isOpen = !room.isOpen;
    }

    isOrganiser(username: string): boolean {
        return username && username.toLowerCase() === GameEnum.Organizer;
    }

    async isLastInRoom(room: Room, roomCode: string): Promise<boolean> {
        return room && room.isStarted && (await this.getSocketsInRoom(roomCode)).length <= 1;
    }

    async canDestroyRoom(socket: Socket, roomCode: string, room: Room): Promise<boolean> {
        return this.isOrganiser(socket.data.username) || this.isLastInRoom(room, roomCode);
    }

    getTextsFromRoom(room: Room): string[] {
        const textAnswers = room.gameStats.users.map((user) => user.data.textAnswer);
        return textAnswers;
    }

    changeQrlStatlines(room: Room, questionIndex: number): void {
        const question = room.gameStats.questions[questionIndex];
        question.statLines = [
            { label: '0%', users: question.pointsGiven.none, isCorrect: false },
            { label: '50%', users: question.pointsGiven.half, isCorrect: false },
            { label: '100%', users: question.pointsGiven.all, isCorrect: false },
        ];
    }

    findNameInStatLine(question: QuestionStats, username: string, statlineIndex: number): string {
        return question.statLines[statlineIndex].users.find((name) => name === username);
    }

    wereStatlinesChanged(question: QuestionStats): boolean {
        return question.statLines.length >= 3;
    }
}
