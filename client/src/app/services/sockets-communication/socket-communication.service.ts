import { Injectable } from '@angular/core';
import { GameStats, PlayerInfo, PlayerState, QuestionStats, QuestionStatsServer, ServerStats, UserSocket } from '@app/interfaces/game-stats';
import { Answer, Quiz } from '@app/interfaces/quiz-model';
import { SocketAnswer, User } from '@app/interfaces/socket-model';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SOCKET_EVENTS } from './socket-communication.constants';

@Injectable({
    providedIn: 'root',
})
export class SocketCommunicationService {
    socket: Socket;

    constructor() {
        this.connect();
    }

    connect() {
        this.socket = io(environment.serverUrl.replace(/\/api$/, ''), { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: unknown): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }

    onTick(action: () => void): void {
        this.on(SOCKET_EVENTS.tick, action);
    }

    onMessageReceived(action: (message: string) => void): void {
        this.on(SOCKET_EVENTS.receiveMessage, action);
    }

    getAllMessages(): Observable<string[]> {
        return new Observable<string[]>((subscriber) => {
            this.send(SOCKET_EVENTS.getAllMessages, null, (res: string[]) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    getRandom(): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.socket.emit('getRandom', null, (response: boolean) => {
                subscriber.next(response);
                subscriber.complete();
            });
        });
    }

    onStatsUpdated(action: () => void): void {
        this.on(SOCKET_EVENTS.getStats, action);
    }

    onAnswerChange(action: (stats: QuestionStats) => void): void {
        this.on(SOCKET_EVENTS.answerChange, (serverStats: QuestionStatsServer) => {
            const stats = this.adaptServerQuestionStat(serverStats);
            action(stats);
        });
    }

    onUserListUpdated(action: (users: User) => void): void {
        this.on<User>(SOCKET_EVENTS.joinedRoom, action);
    }

    onUserLeft(action: (username: string) => void): void {
        this.on<string>(SOCKET_EVENTS.leftRoom, action);
    }

    onRoomClosed(action: () => void): void {
        this.on(SOCKET_EVENTS.roomClosed, () => {
            action();
        });
    }

    onPanicEnabled(action: (isPanicEnabled: boolean) => void): void {
        this.on(SOCKET_EVENTS.panicEnabled, action);
    }

    paniqueMode(questionIndex: number, timeLeft: number): void {
        this.send(SOCKET_EVENTS.paniqueMode, { questionIndex, timeLeft });
    }

    getUser(): Observable<User> {
        return new Observable<User>((subscriber) => {
            this.send(SOCKET_EVENTS.getUser, null, (res: User) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    pauseTimer(): void {
        this.send(SOCKET_EVENTS.pauseTimer);
    }

    banUser(username: string): void {
        this.send(SOCKET_EVENTS.banUser, username);
    }

    joinRoom(roomCode: string): Observable<SocketAnswer> {
        return new Observable<SocketAnswer>((subscriber) => {
            this.send(SOCKET_EVENTS.joinRoom, roomCode, (res: SocketAnswer) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    login(username: string): Observable<SocketAnswer> {
        return new Observable<SocketAnswer>((subscriber) => {
            this.send(SOCKET_EVENTS.login, username, (res: SocketAnswer) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    leaveRoom(): void {
        this.send(SOCKET_EVENTS.logout);
    }

    getStats(): Observable<GameStats> {
        return new Observable<GameStats>((subscriber) => {
            this.send(SOCKET_EVENTS.getStats, (res: ServerStats) => {
                subscriber.next(this.adaptServerStats(res));
                subscriber.complete();
            });
        });
    }

    nextQuestion(): void {
        this.send(SOCKET_EVENTS.nextQuestion);
    }

    onChangeQuestion(action: () => void): void {
        this.on(SOCKET_EVENTS.changeQuestion, action);
    }

    endGame(): void {
        this.send(SOCKET_EVENTS.endGame);
    }

    sendTextAnswer(textAnswer: string): void {
        this.send(SOCKET_EVENTS.sendTextAnswer, textAnswer);
    }

    changeQrlQuestion(questionIndex: number): void {
        this.send(SOCKET_EVENTS.changeQrlQuestion, questionIndex.toString());
    }

    getTextAnswers(): Observable<string[]> {
        return new Observable<string[]>((subscriber) => {
            this.send(SOCKET_EVENTS.getTextAnswers, (res: string[]) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    onShowResults(action: () => void): void {
        this.on(SOCKET_EVENTS.showResults, action);
    }

    onFinalizeAnswers(action: () => void): void {
        this.on(SOCKET_EVENTS.finalizeAnswers, action);
    }

    roundOver(questionIndex: number): void {
        this.send(SOCKET_EVENTS.roundOver, questionIndex.toString());
    }

    confirmAnswer(questionIndex: number): void {
        this.send(SOCKET_EVENTS.confirmAnswer, questionIndex.toString());
    }

    makeUserActive(questionIndex: number): void {
        this.send(SOCKET_EVENTS.makeUserActive, questionIndex.toString());
    }

    endCorrection(questionIndex: number): void {
        this.send(SOCKET_EVENTS.endCorrection, questionIndex.toString());
    }

    onEndRound(action: () => void): void {
        this.on(SOCKET_EVENTS.endRound, action);
    }
    /* eslint-disable max-params */
    givePoints(pointsGiven: number, username: string, percentageGiven: string, questionIndex: number): void {
        this.send(SOCKET_EVENTS.givePoints, { pointsGiven, username, percentageGiven, questionIndex });
    }
    onCorrectQrlQuestions(action: () => void): void {
        this.on(SOCKET_EVENTS.correctQrlQuestions, action);
    }
    updateUsers(): Observable<string[]> {
        return new Observable<string[]>((subscriber) => {
            this.send(SOCKET_EVENTS.updateUsers, null, (response: string[]) => {
                subscriber.next(response);
                subscriber.complete();
            });
        });
    }

    addAnswer(answer: number, questionIndex: number): void {
        this.send<Answer>(SOCKET_EVENTS.addAnswer, { answer, questionIndex });
    }

    getListUsers(): Observable<User[]> {
        return new Observable<User[]>((subscriber) => {
            this.send(SOCKET_EVENTS.getUsers, null, (res: User[]) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }
    roomMessage(message: string): Observable<SocketAnswer> {
        return new Observable<SocketAnswer>((subscriber) => {
            this.send(SOCKET_EVENTS.roomMessage, message, (res: SocketAnswer) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
    }

    createRoom(quizId: string): Observable<string> {
        return new Observable<string>((subscriber) => {
            this.socket.emit(SOCKET_EVENTS.createRoom, quizId, (roomCode: string) => {
                subscriber.next(roomCode);
                subscriber.complete();
            });
        });
    }

    createRandomRoom(quiz: Quiz): Observable<string> {
        return new Observable<string>((subscriber) => {
            this.socket.emit(SOCKET_EVENTS.createRandomRoom, quiz, (roomCode: string) => {
                subscriber.next(roomCode);
                subscriber.complete();
            });
        });
    }

    updatePlayerState(state: PlayerState): void {
        this.send<PlayerState>(SOCKET_EVENTS.updatePlayerState, state);
    }

    mutePlayer(username: string): void {
        this.send<string>(SOCKET_EVENTS.mutePlayer, username);
    }

    onPlayerMuted(action: () => void): void {
        this.on('playerMuted', action);
    }

    onPlayerStateChange(action: (playerInfo: PlayerInfo) => void): void {
        this.on(SOCKET_EVENTS.changedPlayerState, (userStats: UserSocket) => {
            const stats = this.adaptUserStat(userStats);
            action(stats);
        });
    }

    lockRoom(roomCode: string): void {
        this.socket.emit(SOCKET_EVENTS.lockRoom, { roomCode });
    }

    unlockRoom(roomCode: string): void {
        this.socket.emit(SOCKET_EVENTS.unlockRoom, { roomCode });
    }

    attemptStartGame(roomCode: string): Observable<boolean> {
        this.socket.emit(SOCKET_EVENTS.startGame, { roomCode });

        return new Observable<boolean>((observer) => {
            this.socket.on('gameStartResponse', (response: SocketAnswer) => {
                observer.next(response.joined);
                observer.complete();
            });
        });
    }

    onGameStarted(action: () => void): void {
        this.on('gameStarted', action);
    }

    private adaptServerStats(serverStats: ServerStats): GameStats {
        const statsOut: GameStats = { id: serverStats.id, duration: serverStats.duration, questions: [], users: [], name: serverStats.name };
        statsOut.users = serverStats.users.map((user) => {
            return this.adaptUserStat(user);
        });
        statsOut.questions = serverStats.questions.map((question) => {
            return this.adaptServerQuestionStat(question);
        });
        return statsOut;
    }

    private adaptUserStat(serverUser: UserSocket): PlayerInfo {
        return {
            name: serverUser.data.username,
            score: serverUser.data.score,
            bonusCount: serverUser.data.bonus,
            hasLeft: serverUser.data.hasLeft,
            state: serverUser.data.state && !serverUser.data.hasLeft ? serverUser.data.state : PlayerState.PlayerLeft,
            isMuted: serverUser.data.isMuted ? serverUser.data.isMuted : false,
            textAnswer: serverUser.data.textAnswer ? serverUser.data.textAnswer : '',
        };
    }

    private adaptServerQuestionStat(serverQuestion: QuestionStatsServer): QuestionStats {
        return {
            title: serverQuestion.title,
            type: serverQuestion.type,
            points: serverQuestion.points,
            statLines: serverQuestion.statLines.map((line) => {
                return { label: line.label, nbrOfSelection: line.users.length, isCorrect: line.isCorrect };
            }),
        };
    }
}
