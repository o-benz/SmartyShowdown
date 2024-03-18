import { GameClientEvents, GameEnum } from '@app/gateways/game/game.gateway.events';
import { BONUS_MULTIPLIER, NEGATIVE_POINTS, POSITIVE_POINTS } from '@app/model/quiz/quiz.schema';
import { Answer, Room, UserSocket } from '@app/model/socket/socket.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
const NOTFOUND = -1;
@Injectable()
export class SocketGameManagerService {
    private server: Server;

    setServer(server: Server): void {
        this.server = server;
    }

    addAnswer(socket: Socket, ans: Answer, rooms: Map<string, Room>): void {
        const room = rooms.get(socket.data.room);
        if (!room) {
            return;
        }

        const question = room.gameStats.questions[ans.questionIndex];
        if (!question) {
            return;
        }

        const userInChoice = question.statLines[ans.answer].users;
        const usernameIndex = userInChoice.indexOf(socket.data.username);

        if (usernameIndex > NOTFOUND) userInChoice.splice(usernameIndex, 1);
        else userInChoice.push(socket.data.username);
    }

    allAnswered(room: Room): boolean {
        if (!room) return;
        return room.gameStats.users.every((user) => user.data.hasLeft || user.data.answered);
    }

    canConfirmAnswer(socketUser: UserSocket): boolean {
        return socketUser && !socketUser.data.answered;
    }

    finishQuestion(room: Room, questionIndex: string): void {
        room.gameStats.questions[parseInt(questionIndex, 10)].timeFinished = true;
    }

    startGame(room: Room, socket: Socket): void {
        const sockets = room?.gameStats.users;
        const numPlayers = sockets.length;
        const isOrganizer = socket.data.username === GameEnum.Organizer;

        if (room && !room.isOpen && numPlayers >= 1 && isOrganizer) {
            room.isStarted = true;
            this.server.to(socket.data.room).emit(GameClientEvents.GameStarted);
            return;
        }

        let message = GameEnum.CantStartGame;

        if (!isOrganizer) message = GameEnum.OnlyOrganizerCanStart;
        else if (!room || !room.isOpen || numPlayers <= 1) message = GameEnum.RoomLockedOrEmpty;
        socket.emit(GameClientEvents.GameStartResponse, { joined: false, message });
    }

    addPoints(userInStats: UserSocket, socket: Socket, questionPoints: number): void {
        userInStats.data.firstToAnswer = true;
        const bonusPoints = BONUS_MULTIPLIER * questionPoints;
        socket.data.score += bonusPoints;
        socket.data.bonus++;
        userInStats.data.bonus = socket.data.bonus;
    }

    isFirstToAnswer(room: Room, stats: GameStats, questionIndex: number): boolean {
        const noFirstToAnswerYet = !stats.users.some((user) => user.data.firstToAnswer);
        return noFirstToAnswerYet && (!stats.questions[questionIndex].timeFinished || room.gameStats.users.length === 1);
    }

    checkAnswers(socket: Socket, questionIndex: number, room: Room) {
        const stats = room.gameStats;
        const statsLines = stats.questions[questionIndex].statLines;
        const nbOfGoodAnswer = statsLines.filter((choice) => choice.isCorrect).length;

        const rightAnswerCount = statsLines.reduce((count, line) => {
            return count + (line.users.includes(socket.data.username) ? (line.isCorrect ? POSITIVE_POINTS : NEGATIVE_POINTS) : 0);
        }, 0);

        if (rightAnswerCount === nbOfGoodAnswer) {
            const questionPoints = stats.questions[questionIndex].points;
            socket.data.score += questionPoints;

            const userInStats = stats.users.find((user) => user.data.id === socket.id);
            if (userInStats) {
                userInStats.data.score = socket.data.score;
                if (this.isFirstToAnswer(room, stats, questionIndex)) {
                    this.addPoints(userInStats, socket, questionPoints);
                }
            }
        }
    }

    isRoomValid(rooms: Map<string, Room>, socket: Socket): boolean {
        const roomCode = socket.data.room;
        return !roomCode || !rooms.has(roomCode);
    }

    isMessageValid(message: string): boolean {
        return message && message.trim() !== '';
    }

    handleRoomMessage(room: Room, message: string): void {
        room.roomMessages.push(message);
    }
}
