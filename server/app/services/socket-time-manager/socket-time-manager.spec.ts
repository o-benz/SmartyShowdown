import { GameClientEvents } from '@app/gateways/game/game.gateway.events';
import { Room } from '@app/model/socket/socket.schema';
import { GameStats, QuestionStats } from '@app/model/stats/stats.schema';
import { SocketTimeManagerService } from '@app/services/socket-time-manager/socket-time-manager.service';
import { Server } from 'socket.io';

describe('SocketTimeManager', () => {
    let service: SocketTimeManagerService;
    let mockServer: Server;
    let roomMock: Room;

    beforeEach(() => {
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            except: jest.fn().mockReturnThis(),
            sockets: {
                sockets: new Map(),
            },
        } as unknown as Server;

        service = new SocketTimeManagerService();
        service['server'] = mockServer;

        roomMock = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: {
                questions: [{} as QuestionStats, {} as QuestionStats],
            } as GameStats,
            isStarted: true,
            isPaused: false,
            delayTick: 1000,
            timer: null,
            startingTime: '',
            socketTimers: new Map(),
        };

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should set server', () => {
        service.setServer(mockServer);
    });

    it('should reset timer', () => {
        const DEF_TIME = 1000;
        service.resetTimer(roomMock, DEF_TIME);
    });

    it('should set timer and emit events', () => {
        service.setTimer(roomMock, 'roomCode1');
        const delay = 1000;
        jest.advanceTimersByTime(delay);
        expect(mockServer.to).toHaveBeenCalledWith('roomCode1');
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.Tick, {});
    });

    it('should pause timer if room is not paused', () => {
        const spy = jest.spyOn(service, 'resetTimer');
        roomMock.isPaused = false;
        service.setTimer(roomMock, 'roomCode1');
        service.pauseTimer(roomMock, 'roomCode1');
        expect(roomMock.isPaused).toBeTruthy();
        expect(spy).toHaveBeenCalled();
        expect(roomMock.isPaused).toBe(true);
    });

    it('should resume timer if room is paused', () => {
        const spy = jest.spyOn(service, 'setTimer');
        roomMock.isPaused = true;
        service.setTimer(roomMock, 'roomCode1');
        service.pauseTimer(roomMock, 'roomCode1');
        expect(roomMock.isPaused).toBeFalsy();
        expect(spy).toHaveBeenCalled();
        expect(roomMock.isPaused).toBe(false);
    });

    it('should get question type', () => {
        roomMock.gameStats.questions[0].type = 'QRL';
        const result = service.getQuestionType(0, roomMock);
        expect(result).toBe('QRL');
    });

    it('should enable panic Timer if more than 20 seconds for QRL', () => {
        const resetTimerSpy = jest.spyOn(service, 'resetTimer');
        const time = 21;
        const delay = 250;
        jest.spyOn(service, 'getQuestionType').mockReturnValue('QRL');
        const result = service.panicTimer(roomMock, '1234', time, 0);
        expect(result).toBeTruthy();
        expect(resetTimerSpy).toHaveBeenCalled();
        expect(roomMock.delayTick).toBe(delay);
        jest.advanceTimersByTime(delay);
        expect(mockServer.to).toHaveBeenCalledWith('1234');
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.Tick, {});
    });

    it('should enable panic Timer if more than 10 seconds for QCM', () => {
        const resetTimerSpy = jest.spyOn(service, 'resetTimer');

        jest.spyOn(service, 'getQuestionType').mockReturnValue('QCM');
        const time = 11;
        const delay = 250;
        const result = service.panicTimer(roomMock, '1234', time, 0);
        expect(result).toBeTruthy();
        expect(resetTimerSpy).toHaveBeenCalled();
        expect(roomMock.delayTick).toBe(delay);
        jest.advanceTimersByTime(delay);
        expect(mockServer.to).toHaveBeenCalledWith('1234');
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.Tick, {});
    });

    it('should not enable panic Timer if less than 10 seconds for QCM', () => {
        jest.spyOn(service, 'getQuestionType').mockReturnValue('QCM');
        const time = 9;
        const result = service.panicTimer(roomMock, '1234', time, 0);
        expect(result).toBeFalsy();
    });

    it('should not enable panic Timer if less than 20 seconds for QRL', () => {
        jest.spyOn(service, 'getQuestionType').mockReturnValue('QRL');
        const time = 19;
        const result = service.panicTimer(roomMock, '1234', time, 0);
        expect(result).toBeFalsy();
    });

    it('should unpause room on panic', () => {
        const spy = jest.spyOn(service, 'resetTimer');

        jest.spyOn(service, 'getQuestionType').mockReturnValue('QRL');
        const time = 60;
        roomMock.isPaused = true;
        service.panicTimer(roomMock, '1234', time, 0);

        const PANIC_TIME = 250;
        expect(roomMock.isPaused).toBe(false);
        expect(spy).toHaveBeenCalledWith(roomMock, PANIC_TIME);
    });
});
