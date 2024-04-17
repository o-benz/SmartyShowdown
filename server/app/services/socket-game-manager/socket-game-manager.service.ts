import { GameClientEvents, GameEnum, GameEvents } from '@app/gateways/game/game.gateway.events';
import { BONUS_MULTIPLIER, NEGATIVE_POINTS, POSITIVE_POINTS } from '@app/model/quiz/quiz.schema';
import { Answer, GivePointsInfo, Room, UserSocket } from '@app/model/socket/socket.schema';
import { GameStats, QuestionStats, StatsLine } from '@app/model/stats/stats.schema';
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
        if (!room) return;
        const question = room.gameStats.questions[ans.questionIndex];
        if (!question) return;

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
        return Boolean(socketUser && !socketUser.data.answered);
    }

    getQuestionType(room: Room, questionIndex: string): string {
        return room.gameStats.questions[parseInt(questionIndex, 10)].type;
    }

    finishQuestion(room: Room, questionIndex: string): void {
        room.gameStats.questions[parseInt(questionIndex, 10)].timeFinished = true;
    }

    canGameBeStarted(numPlayers: number, room: Room, isOrganizer: boolean): boolean {
        return room && !room.isOpen && numPlayers >= 1 && isOrganizer;
    }

    startGame(room: Room, socket: Socket): void {
        const sockets = room?.gameStats?.users;
        const numPlayers = sockets?.length;
        const isOrganizer = socket.data.username === GameEnum.Organizer;

        if (this.canGameBeStarted(numPlayers, room, isOrganizer)) {
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

    getRightAnswerCount(username: string, statsLines: StatsLine[]): number {
        return statsLines.reduce((count, line) => {
            if (line.users.includes(username)) return count + (line.isCorrect ? POSITIVE_POINTS : NEGATIVE_POINTS);
            else return count;
        }, 0);
    }

    checkAnswers(socket: Socket, questionIndex: number, room: Room) {
        const stats = room.gameStats;
        const statsLines = stats.questions[questionIndex].statLines;
        const nbOfGoodAnswer = statsLines.filter((choice) => choice.isCorrect).length;
        const rightAnswerCount = this.getRightAnswerCount(socket.data.username, statsLines);
        const userInStats = stats.users.find((user) => user.data.id === socket.id);

        if (rightAnswerCount === nbOfGoodAnswer && userInStats) {
            const questionPoints = stats.questions[questionIndex].points;
            socket.data.score += questionPoints;
            userInStats.data.score = socket.data.score;
            if (this.isFirstToAnswer(room, stats, questionIndex)) {
                this.addPoints(userInStats, socket, questionPoints);
            }
        }
    }

    isRoomValid(rooms: Map<string, Room>, socket: Socket): boolean {
        const roomCode = socket.data.room;
        return rooms.has(roomCode);
    }

    isMessageValid(message: string): boolean {
        return Boolean(message && message.trim() !== '');
    }

    handleRoomMessage(room: Room, message: string): void {
        if (room) room.roomMessages.push(message);
    }
    /* eslint-disable max-params */
    changeUserActivityOnPress(question: QuestionStats, username: string, indexTo: number, indexFrom: number): void {
        question.statLines[indexTo].users.push(username);
        const inactiveIndex = question.statLines[indexFrom].users.indexOf(username);
        if (inactiveIndex !== NOTFOUND) {
            question.statLines[indexFrom].users.splice(inactiveIndex, 1);
        }
    }

    givePoints(room: Room, socketUser: UserSocket, givePointsInfo: GivePointsInfo): void {
        if (socketUser) socketUser.data.score += givePointsInfo.pointsGiven;
        if (room) {
            const pointsGivenArray = room.gameStats.questions[givePointsInfo.questionIndex].pointsGiven;
            switch (givePointsInfo.percentageGiven) {
                case '0%': {
                    pointsGivenArray.none.push(givePointsInfo.username);
                    break;
                }
                case '50%': {
                    pointsGivenArray.half.push(givePointsInfo.username);
                    break;
                }
                case '100%': {
                    pointsGivenArray.all.push(givePointsInfo.username);
                    break;
                }
            }
        }
    }

    sendPlayerLeftMessage(socket: Socket, room: Room) {
        const currentDate = new Date();
        const message = `[${currentDate.getHours()}h:${currentDate.getMinutes()}min Système]: Le joueur "${socket.data.username}" a quitté`;
        this.handleRoomMessage(room, message);
        this.server.to(socket.data.room).emit(GameEvents.SendMessage, message);
    }
}
