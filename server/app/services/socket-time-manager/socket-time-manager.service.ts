import { GameClientEvents } from '@app/gateways/game/game.gateway.events';
import { Room } from '@app/model/socket/socket.schema';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

const MAX_TIME_QCM = 10;
const MAX_TIME_QRL = 20;
const PANIC_DELAY = 250;

@Injectable()
export class SocketTimeManagerService {
    private server: Server;

    setServer(server: Server): void {
        this.server = server;
    }

    resetTimer(room: Room, delay: number): void {
        room.delayTick = delay;
        clearInterval(room.timer as NodeJS.Timeout);
    }

    setTimer(room: Room, roomCode: string): void {
        clearInterval(room.timer as NodeJS.Timeout);
        room.timer = setInterval(() => {
            this.server.to(roomCode).emit(GameClientEvents.Tick, {});
        }, room.delayTick);
    }

    pauseTimer(room: Room, roomCode: string): void {
        if (!room.isPaused) this.resetTimer(room, room.delayTick);
        else this.setTimer(room, roomCode);
        room.isPaused = !room.isPaused;
    }

    getQuestionType(questionIndex: number, room: Room): string {
        return room.gameStats.questions[questionIndex].type;
    }

    /* eslint-disable max-params */
    panicTimer(room: Room, roomCode: string, timeLeft: number, questionIndex: number): boolean {
        const type = this.getQuestionType(questionIndex, room);

        if ((type === 'QCM' && timeLeft < MAX_TIME_QCM) || (type === 'QRL' && timeLeft < MAX_TIME_QRL)) return false;
        if (room.isPaused) room.isPaused = !room.isPaused;

        this.resetTimer(room, PANIC_DELAY);
        room.timer = setInterval(() => {
            this.server.to(roomCode).emit(GameClientEvents.Tick, {});
        }, room.delayTick);
        return true;
    }
}
