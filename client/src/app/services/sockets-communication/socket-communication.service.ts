import { Injectable } from '@angular/core';
import { GameStats, ServerStats } from '@app/interfaces/game-stats';
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

    onStatsUpdated(action: () => void): void {
        this.on(SOCKET_EVENTS.getStats, action);
    }

    onAnswerChange(action: () => void): void {
        this.on(SOCKET_EVENTS.answerChange, action);
    }

    onUserListUpdated(action: (users: User) => void): void {
        this.on<User>(SOCKET_EVENTS.joinedRoom, action);
    }

    onUserLeft(action: (username: string) => void): void {
        this.on<string>(SOCKET_EVENTS.leftRoom, action);
    }

    onRoomClosed(action: () => void): void {
        this.on(SOCKET_EVENTS.roomClosed, action);
    }

    getUser(): Observable<User> {
        return new Observable<User>((subscriber) => {
            this.send(SOCKET_EVENTS.getUser, null, (res: User) => {
                subscriber.next(res);
                subscriber.complete();
            });
        });
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

    onShowResults(action: () => void): void {
        this.on(SOCKET_EVENTS.showResults, action);
    }

    onFinalizeAnswers(action: () => void): void {
        this.on(SOCKET_EVENTS.finalizeAnswers, action);
    }

    roundOver(): void {
        this.send(SOCKET_EVENTS.roundOver);
    }
    confirmAnswer(): void {
        this.send(SOCKET_EVENTS.confirmAnswer);
    }

    onEndRound(action: () => void): void {
        this.on(SOCKET_EVENTS.endRound, action);
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
        this.send(SOCKET_EVENTS.addAnswer, { answer, questionIndex });
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
                localStorage.setItem('isOrganizer', 'true');

                subscriber.next(roomCode);
                subscriber.complete();
            });
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
        const statsOut: GameStats = { id: serverStats.id, duration: serverStats.duration, questions: [], users: [] };
        statsOut.users = serverStats.users.map((usersocket) => {
            return { name: usersocket.username, score: usersocket.score, bonusCount: usersocket.bonus };
        });
        statsOut.questions = serverStats.questions.map((question) => {
            return {
                title: question.title,
                type: question.type,
                points: question.points,
                statLines: question.statLines.map((line) => {
                    return { label: line.label, nbrOfSelection: line.users.length, isCorrect: line.isCorrect };
                }),
            };
        });
        return statsOut;
    }
}
