import { TestBed } from '@angular/core/testing';
import {
    GameStats,
    PlayerInfo,
    PlayerState,
    QuestionStats,
    QuestionStatsServer,
    ServerStats,
    StatsLine,
    StatsLineServer,
    UserSocket,
} from '@app/interfaces/game-stats';
import { Quiz } from '@app/interfaces/quiz-model';
import { SocketAnswer } from '@app/interfaces/socket-model';
import { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from './socket-communication.constants';
import { SocketCommunicationService } from './socket-communication.service';

/* eslint-disable max-lines */

class MockSocket {
    emit = jasmine.createSpy('emit');
    on = jasmine.createSpy('on');
    disconnect = jasmine.createSpy('disconnect');
    connect = jasmine.createSpy('connect');
}

describe('SocketCommunicationService', () => {
    let service: SocketCommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketCommunicationService);
        service.socket = new MockSocket() as unknown as Socket;
        service.connect();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect on creation', () => {
        const spy = spyOn(service, 'connect');
        service.connect();
        expect(spy).toHaveBeenCalled();
    });

    it('should disconnect', () => {
        const spy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle socket on method', () => {
        const spy = spyOn(service.socket, 'on');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const callback = () => {};
        service.on('testEvent', callback);
        expect(spy).toHaveBeenCalledWith('testEvent', callback);
    });

    it('should handle socket send method', () => {
        const spy = spyOn(service.socket, 'emit');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const callback = () => {};
        service.send('testEvent', 'testData', callback);
        expect(spy).toHaveBeenCalledWith('testEvent', 'testData', callback);
    });

    it('should join room and return observable', (done) => {
        service.socket.emit = jasmine.createSpy().and.callFake((event, data, callback) => {
            callback(true);
        });

        service.joinRoom('1234').subscribe((result) => {
            expect(result).toBeTrue();
            done();
        });
    });

    it('should login and return observable', (done) => {
        service.socket.emit = jasmine.createSpy().and.callFake((event, data, callback) => {
            callback(true);
        });

        service.login('testUser').subscribe((result) => {
            expect(result).toBeTrue();
            done();
        });
    });

    it('should emit createRoom event and return room code via observable', (done) => {
        const fakeRoomCode = 'room123';
        service.socket.emit = jasmine.createSpy().and.callFake((event, data, callback) => {
            if (typeof callback === 'function') {
                callback(fakeRoomCode);
            }
        });
        service.createRoom('1234').subscribe((roomCode) => {
            expect(roomCode).toBe(fakeRoomCode);
            expect(service.socket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.createRoom, '1234', jasmine.any(Function));
            done();
        });
    });

    it('should set up listener for room closed and leave room', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onRoomClosed(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.roomClosed, jasmine.any(Function));
    });

    it('should set up listener for onTick', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onTick(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.tick, jasmine.any(Function));
    });

    it('should set up listener for onChangeQuestion', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onChangeQuestion(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.changeQuestion, jasmine.any(Function));
    });

    it('should set up listener for onShowResults', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onShowResults(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.showResults, jasmine.any(Function));
    });

    it('should set up listener for onEndRound', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onEndRound(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.endRound, jasmine.any(Function));
    });

    it('should set up listener for onCorrectQrlQuestions', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onCorrectQrlQuestions(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.correctQrlQuestions, jasmine.any(Function));
    });

    it('should set up listener for onFinalizeAnswers', () => {
        const action = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onFinalizeAnswers(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.finalizeAnswers, jasmine.any(Function));
    });

    it('should send ban user event with username', () => {
        const testUsername = 'testUser';
        const sendSpy = spyOn(service, 'send');
        service.banUser(testUsername);
        expect(sendSpy).toHaveBeenCalledWith(SOCKET_EVENTS.banUser, testUsername);
    });

    it('should send logout event when leaving room', () => {
        const sendSpy = spyOn(service, 'send');
        service.leaveRoom();
        expect(sendSpy).toHaveBeenCalledWith(SOCKET_EVENTS.logout);
    });

    it('should set up an event listener for user list updates', () => {
        const userUpdateAction = jasmine.createSpy('userUpdateAction');
        spyOn(service.socket, 'on');
        service.onUserListUpdated(userUpdateAction);
        expect(service.socket.on).toHaveBeenCalledWith(SOCKET_EVENTS.joinedRoom, userUpdateAction);
    });

    it('should send playerState event when called', () => {
        const sendSpy = spyOn(service, 'send');
        service.updatePlayerState(PlayerState.FirstInteraction);
        expect(sendSpy).toHaveBeenCalledWith(SOCKET_EVENTS.updatePlayerState, PlayerState.FirstInteraction);
    });

    it('should send mutePlayer event when called', () => {
        const sendSpy = spyOn(service, 'send');
        service.mutePlayer('username');
        expect(sendSpy).toHaveBeenCalledWith(SOCKET_EVENTS.mutePlayer, 'username');
    });

    it('should set up an event listener for player muted', () => {
        const userMutedAction = jasmine.createSpy('playerMutedAction');
        spyOn(service.socket, 'on');
        service.onPlayerMuted(userMutedAction);
        expect(service.socket.on).toHaveBeenCalledWith(SOCKET_EVENTS.playerMuted, userMutedAction);
    });

    it('should set up an event listener for player state change', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'adaptUserStat');
        const mockOn = jasmine.createSpy('on').and.callFake((event, action) => {
            action();
        });
        service.on = mockOn;
        const userUpdateAction = jasmine.createSpy('playerStateChange');
        service.onPlayerStateChange(userUpdateAction);
        expect(mockOn).toHaveBeenCalledWith(SOCKET_EVENTS.changedPlayerState, jasmine.any(Function));
        expect(spy).toHaveBeenCalled();
    });

    it('should set up an event listener for user leaving', () => {
        const userLeftAction = jasmine.createSpy('userLeftAction');
        spyOn(service.socket, 'on');
        service.onUserLeft(userLeftAction);
        expect(service.socket.on).toHaveBeenCalledWith(SOCKET_EVENTS.leftRoom, userLeftAction);
    });

    it('should emit lockRoom event with room code', () => {
        const roomCode = 'testRoomCode';
        const emitSpy = spyOn(service.socket, 'emit');
        service.lockRoom(roomCode);
        expect(emitSpy).toHaveBeenCalledWith(SOCKET_EVENTS.lockRoom, { roomCode });
    });

    it('should emit unlockRoom event with room code', () => {
        const roomCode = 'testRoomCode';
        const emitSpy = spyOn(service.socket, 'emit');
        service.unlockRoom(roomCode);
        expect(emitSpy).toHaveBeenCalledWith(SOCKET_EVENTS.unlockRoom, { roomCode });
    });

    describe('onGameStarted', () => {
        it('should set up an event listener for game started and call provided action', () => {
            const action = jasmine.createSpy('action');
            const onSpy = spyOn(service.socket, 'on').and.callFake((event: string, callback: () => void) => {
                if (event === 'gameStarted') {
                    callback();
                }
                return service.socket;
            });
            service.onGameStarted(action);
            expect(onSpy).toHaveBeenCalledWith('gameStarted', jasmine.any(Function));
            expect(action).toHaveBeenCalled();
        });
    });

    it('onMessageReceived should call action when receiveMessage event is emitted', () => {
        const action = jasmine.createSpy('action');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(service, 'on').and.callFake((event, callback: (data: any) => void) => {
            if (event === SOCKET_EVENTS.receiveMessage) {
                callback('Test message'); // Simulate the event being emitted
            }
        });
        service.onMessageReceived(action);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.receiveMessage, jasmine.any(Function));
        expect(action).toHaveBeenCalledWith('Test message');
    });

    it('getAllMessages should return all messages', (done) => {
        const messages = ['message1', 'message2', 'message3'];
        const sendSpy = spyOn(service, 'send').and.callFake((event, data, callback: (data: string[]) => void) => {
            if (event === SOCKET_EVENTS.getAllMessages) {
                callback(messages);
            }
        });
        service.getAllMessages().subscribe((res) => {
            expect(sendSpy).toHaveBeenCalledWith(SOCKET_EVENTS.getAllMessages, null, jasmine.any(Function));
            expect(res).toEqual(messages);
            done();
        });
    });

    it('onStatsUpdated should call the action when the getStats event is emitted', () => {
        const mockAction = jasmine.createSpy('action');
        const mockOn = jasmine.createSpy('on').and.callFake((event, action) => {
            action();
        });
        service.on = mockOn;

        service.onStatsUpdated(mockAction);

        expect(mockOn).toHaveBeenCalledWith(SOCKET_EVENTS.getStats, jasmine.any(Function));
        expect(mockAction).toHaveBeenCalled();
    });

    it('onAnswerChange should call the action when the answerChange event is emitted', () => {
        const mockAction = jasmine.createSpy('action');
        const mockServerStats = {
            title: 'testTitle',
            type: 'testType',
            points: 100,
            statLines: [
                {
                    label: 'testLabel',
                    users: ['user1', 'user2'],
                    nbrOfSelection: 2,
                },
            ] as unknown as StatsLine[],
        } as unknown as QuestionStatsServer;
        const mockOn = jasmine.createSpy('on').and.callFake((event, action) => {
            action(mockServerStats);
        });
        service.on = mockOn;

        service.onAnswerChange(mockAction);

        expect(mockOn).toHaveBeenCalledWith(SOCKET_EVENTS.answerChange, jasmine.any(Function));
        expect(mockAction).toHaveBeenCalled();
    });

    it('onRoomClosed should call the action when the roomClosed event is emitted', () => {
        const mockAction = jasmine.createSpy('action');
        const mockOn = jasmine.createSpy('on').and.callFake((event, action) => {
            action();
        });
        service.on = mockOn;

        service.onRoomClosed(mockAction);

        expect(mockOn).toHaveBeenCalledWith(SOCKET_EVENTS.roomClosed, jasmine.any(Function));
        expect(mockAction).toHaveBeenCalled();
    });

    it('getUser should return the user', (done) => {
        const mockUser = {
            id: 'testId',
            username: 'testUsername',
            room: 'testRoom',
            score: 100,
            bonus: 10,
            answered: true,
            firstToAnswer: true,
            hasLeft: false,
        };
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: unknown) => void) => {
            callback(mockUser);
        });
        service.send = mockSend;

        service.getUser().subscribe((res) => {
            expect(mockSend).toHaveBeenCalledWith(SOCKET_EVENTS.getUser, null, jasmine.any(Function));
            expect(res).toEqual(mockUser);
            done();
        });
    });

    it('getStats should return the stats', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: unknown) => void) => {
            callback('testStats');
        });
        const mockAdaptServerStats = jasmine.createSpy('adaptServerStats').and.returnValue('testStats');
        service.send = mockSend;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).adaptServerStats = mockAdaptServerStats;
        const mockServerStats: ServerStats = {
            id: 'testId',
            duration: 100,
            questions: [],
            users: [],
            name: 'testName',
        };
        const mockGameStats: GameStats = {
            id: 'testId',
            duration: 100,
            questions: [],
            users: [],
            name: 'testName',
        };
        mockSend.and.callFake((event, callback) => {
            expect(event).toBe(SOCKET_EVENTS.getStats);
            callback(mockServerStats);
        });
        mockAdaptServerStats.and.returnValue(mockGameStats);
        service.getStats().subscribe((gameStats) => {
            expect(gameStats).toBe(mockGameStats);
            done();
        });
    });

    it('getTextAnswers should return the answers', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: unknown) => void) => {
            callback('testStats');
        });
        const mockAdaptServerStats = jasmine.createSpy('adaptServerStats').and.returnValue('testStats');
        service.send = mockSend;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).adaptServerStats = mockAdaptServerStats;
        const testAnswer: string[] = ['testAnswer'];

        mockSend.and.callFake((event, callback) => {
            expect(event).toBe(SOCKET_EVENTS.getTextAnswers);
            callback(testAnswer);
        });
        service.getTextAnswers().subscribe((gameStats) => {
            // eslint-disable-next-line
            expect(gameStats).toEqual(['testAnswer']);
            done();
        });
    });

    it('getStats should get stats and adapt server stats', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: unknown) => void) => {
            callback('testStats');
        });
        service.send = mockSend;
        const mockServerStats: ServerStats = {
            id: 'testId',
            duration: 100,
            questions: [
                {
                    title: 'testTitle',
                    type: 'testType',
                    points: 100,
                    statLines: [{ label: 'testLabel', users: ['un', 'deux'], isCorrect: true }] as StatsLineServer[],
                },
            ],
            users: [
                {
                    data: { username: 'testUser', score: 100, bonus: 10, hasLeft: false, state: PlayerState.NoInteraction, textAnswer: '' },
                } as UserSocket,
            ],
            name: 'testName',
        };
        const mockGameStats: GameStats = {
            id: 'testId',
            duration: 100,
            questions: [
                { title: 'testTitle', type: 'testType', points: 100, statLines: [{ label: 'testLabel', nbrOfSelection: 2, isCorrect: true }] },
            ] as unknown as QuestionStats[],
            users: [
                {
                    name: 'testUser',
                    score: 100,
                    bonusCount: 10,
                    hasLeft: false,
                    state: PlayerState.NoInteraction,
                    isMuted: false,
                    textAnswer: '',
                } as PlayerInfo,
            ],
            name: 'testName',
        };
        mockSend.and.callFake((event, callback) => {
            expect(event).toBe(SOCKET_EVENTS.getStats);
            callback(mockServerStats);
        });
        service.getStats().subscribe((gameStats) => {
            expect(gameStats).toEqual(mockGameStats);
            done();
        });
    });

    it('nextQuestion should emit the nextQuestion event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.nextQuestion();
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.nextQuestion);
    });

    it('endGame should emit the endGame event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.endGame();
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.endGame);
    });

    it('roundOver should emit the roundOver event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.roundOver(0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.roundOver, '0');
    });

    it('confirmAnswer should emit the confirmAnswer event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.confirmAnswer(0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.confirmAnswer, '0');
    });

    it('makeUserActive should emit the makeUserActive event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.makeUserActive(0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.makeUserActive, '0');
    });

    it('endCorrection should emit the endCorrection event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.endCorrection(0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.endCorrection, '0');
    });

    it('sendTextAnswer should emit the sendTextAnswer event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.sendTextAnswer('test');
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.sendTextAnswer, 'test');
    });

    it('changeQrlQuestion should emit the changeQrlQuestion event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.changeQrlQuestion(0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.changeQrlQuestion, '0');
    });

    it('givePoints should emit the givePoints event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.givePoints(0, 'hugo', '0%', 0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.givePoints, {
            pointsGiven: 0,
            username: 'hugo',
            percentageGiven: '0%',
            questionIndex: 0,
        });
    });

    it('updateUsers should return an observable of the updated users', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: string[]) => void) => {
            callback(['user1', 'user2']);
        });
        service.send = mockSend;
        service.updateUsers().subscribe((res) => {
            expect(res).toEqual(['user1', 'user2']);
            done();
        });
    });

    it('addAnswer should emit the addAnswer event', () => {
        const mockEmit = jasmine.createSpy('emit');
        service.socket.emit = mockEmit;
        service.addAnswer(0, 0);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.addAnswer, { answer: 0, questionIndex: 0 });
    });

    it('getListUsers should return an observable of the list of users', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: string[]) => void) => {
            callback(['user1', 'user2']);
        });
        service.send = mockSend;
        service.getListUsers().subscribe((res) => {
            expect(res).toEqual(jasmine.arrayContaining(['user1', 'user2']));
            done();
        });
    });

    it('roomMessage should return an observable of the response', (done) => {
        const mockSend = jasmine.createSpy('send').and.callFake((event, data, callback: (data: string) => void) => {
            callback('testResponse');
        });
        service.send = mockSend;
        service.roomMessage('testMessage').subscribe((res) => {
            expect(res).toEqual('testResponse' as unknown as SocketAnswer);
            done();
        });
    });

    it('attemptStartGame should return an observable of the result', (done) => {
        const mockEmit = jasmine.createSpy('emit');
        const mockOn = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === 'gameStartResponse') {
                callback({ joined: true });
            }
        });
        service.socket.emit = mockEmit;
        service.socket.on = mockOn;
        service.attemptStartGame('testRoomCode').subscribe({
            next: (res) => {
                expect(res).toBeTrue();
                expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.startGame, { roomCode: 'testRoomCode' });
                done();
            },
        });
    });

    it('adaptUserStat should adapt server socketUser to playerInfo', () => {
        const serverUserList = {
            data: { username: 'User1', score: 10, bonus: 2, hasLeft: false, answered: false, state: 2, isMuted: true, textAnswer: 'lol' },
        };
        const adaptedUserStat = service['adaptUserStat'](serverUserList);
        expect(adaptedUserStat).toEqual({ name: 'User1', score: 10, bonusCount: 2, hasLeft: false, state: 2, isMuted: true, textAnswer: 'lol' });
    });

    it('adaptUserStat should handle undefined state and default to no interaction and unmuted', () => {
        const serverUserList = { data: { username: 'User1', score: 10, bonus: 2, hasLeft: false, answered: false } };
        const adaptedUserStat = service['adaptUserStat'](serverUserList);
        expect(adaptedUserStat).toEqual({ name: 'User1', score: 10, bonusCount: 2, hasLeft: false, state: 0, isMuted: false, textAnswer: '' });
    });

    it('should set up an event listener for panic enabled', () => {
        const mockAction = jasmine.createSpy('action');
        const onSpy = spyOn(service.socket, 'on');
        service.onPanicEnabled(mockAction);
        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.panicEnabled, mockAction);
    });

    it('should emit paniqueMode event with questionIndex and timeLeft', () => {
        const mockEmit = spyOn(service.socket, 'emit');
        const testQuestionIndex = 1;
        const testTimeLeft = 30;
        service.paniqueMode(testQuestionIndex, testTimeLeft);
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.paniqueMode, { questionIndex: testQuestionIndex, timeLeft: testTimeLeft });
    });

    it('should emit pauseTimer event', () => {
        const mockEmit = spyOn(service.socket, 'emit');
        service.pauseTimer();
        expect(mockEmit).toHaveBeenCalledWith(SOCKET_EVENTS.pauseTimer);
    });

    it('should emit a boolean response when getRandom is called', (done) => {
        const mockResponse = true;
        const mockEmit = jasmine.createSpy('emit').and.callFake((event, data, callback) => {
            if (event === 'getRandom') {
                callback(mockResponse);
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.socket = { emit: mockEmit } as any;
        service.getRandom().subscribe((response) => {
            expect(response).toEqual(mockResponse);
            done();
        });
        expect(mockEmit).toHaveBeenCalledWith('getRandom', null, jasmine.any(Function));
    });

    it('should emit createRoom event and return room code via observable', (done) => {
        const fakeRoomCode = 'room123';
        const mockQuiz: Quiz = {
            id: '1',
            visible: true,
            title: 'test Quiz',
            description: 'test quiz',
            duration: 60,
            lastModification: '',
            questions: [],
        };

        service.socket.emit = jasmine.createSpy().and.callFake((event, data, callback) => {
            if (typeof callback === 'function') {
                callback(fakeRoomCode);
            }
        });
        service.createRandomRoom(mockQuiz).subscribe((roomCode) => {
            expect(roomCode).toBe(fakeRoomCode);
            expect(service.socket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.createRandomRoom, mockQuiz, jasmine.any(Function));
            done();
        });
    });
});
