import { Answer, GivePointsInfo, Room, UserSocket } from '@app/model/socket/socket.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { HistoricService } from '@app/services/historic-manager/historic.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketGameManagerService } from '@app/services/socket-game-manager/socket-game-manager.service';
import { SocketTimeManagerService } from '@app/services/socket-time-manager/socket-time-manager.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameClientEvents, GameEnum, GameEvents } from './game.gateway.events';
/* eslint-disable max-lines */

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');
const DEFAULT_DELAY = 1000;

describe('GameGateway', () => {
    let gateway: GameGateway;

    const mockQuizService = {
        generateRandomID: jest.fn(),
        populateGameStats: jest.fn(),
        populateGameStatsRandom: jest.fn(),
        validateAnswer: jest.fn(),
    };

    const mockSocketService = {
        setServer: jest.fn(),
        isUserValid: jest.fn(),
        isUniqueUsername: jest.fn(),
        isNotOrganizer: jest.fn(),
        getSocketsInRoom: jest.fn(),
        getAllUsernamesInRoom: jest.fn(),
        getAllMessages: jest.fn(),
        addMessageToRoom: jest.fn(),
        isLoginValid: jest.fn(),
        populateRoom: jest.fn(),
        initializeOrganizerSocket: jest.fn(),
        canJoinRoom: jest.fn(),
        attemptJoinRoom: jest.fn(),
        isUserInfoValid: jest.fn(),
        populateUserSocket: jest.fn(),
        confirmLoggedIn: jest.fn(),
        attemptLogin: jest.fn(),
        findSocketUser: jest.fn(),
        addToBannedList: jest.fn(),
        getBannedSocket: jest.fn(),
        userLeaveRoom: jest.fn(),
        resetUser: jest.fn(),
        updateLockRoom: jest.fn(),
        initializeRandomOrganizerSocket: jest.fn(),
        canDestroyRoom: jest.fn(),
        getTextsFromRoom: jest.fn(),
        changeQrlStatlines: jest.fn(),
        findNameInStatLine: jest.fn(),
        wereStatlinesChanged: jest.fn(),
    };

    const mockSocket = {
        id: 'socketId',
        data: { room: '1', username: 'test', answered: false },
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
    };

    const mockSocketGameManagerService = {
        setServer: jest.fn(),
        addAnswer: jest.fn(),
        allAnswered: jest.fn(),
        canConfirmAnswer: jest.fn(),
        finishQuestion: jest.fn(),
        startGame: jest.fn(),
        addPoints: jest.fn(),
        isFirstToAnswer: jest.fn(),
        checkAnswer: jest.fn(),
        isRoomValid: jest.fn(),
        isMessageValid: jest.fn(),
        handleRoomMessage: jest.fn(),
        checkAnswers: jest.fn(),
        getQuestionType: jest.fn(),
        sendPlayerLeftMessage: jest.fn(),
        givePoints: jest.fn(),
        changeUserActivityOnPress: jest.fn(),
    };

    const mockSocketTimeManagerService = {
        setServer: jest.fn(),
        resetTimer: jest.fn(),
        setTimer: jest.fn(),
        pauseTimer: jest.fn(),
        getQuestionType: jest.fn(),
        panicTimer: jest.fn(),
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        except: jest.fn().mockReturnThis(),
        sockets: {
            sockets: new Map(),
        },
    };

    const mockGameStats: GameStats = {
        id: '',
        duration: 10,
        questions: [{ title: 'deez', statLines: [], type: 'QCM', points: 100000000000 }],
        users: [],
        name: '',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: QuizService, useValue: mockQuizService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: SocketGameManagerService, useValue: mockSocketGameManagerService },
                { provide: SocketTimeManagerService, useValue: mockSocketTimeManagerService },
                { provide: HistoricService, useValue: {} },
                { provide: HistoricService, useValue: { populateHistory: jest.fn() } },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);

        // J'utilise Any car essayer de le faire as Socket ne marche pas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = mockServer as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should create a random room', async () => {
        mockQuizService.generateRandomID.mockReturnValue('1234');
        mockQuizService.populateGameStatsRandom.mockResolvedValue(mockGameStats);
        const mockQuiz = {
            id: 'string',
            visible: true,
            title: 'string',
            description: 'string',
            duration: 20,
            lastModification: 'string',
            questions: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.createRoomRandom(mockSocket as any, mockQuiz);

        expect(result).toBe('1234');
        expect(mockSocketService.initializeRandomOrganizerSocket).toHaveBeenCalled();
        expect(mockQuizService.populateGameStatsRandom).toHaveBeenCalled();
    });

    it('should create a room', async () => {
        mockQuizService.generateRandomID.mockReturnValue('1234');
        mockQuizService.populateGameStats.mockResolvedValue(mockGameStats);
        mockSocketService.populateRoom.mockImplementation((rooms, socket) => {
            const room = '1234';
            rooms.set(room, {} as Room);
            socket.join(room);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.createRoom(mockSocket as any, 'quizID');

        expect(result).toBe('1234');
        expect(mockSocket.join).toHaveBeenCalledWith('1234');
    });

    it('should join a room', async () => {
        mockSocketService.attemptJoinRoom.mockReturnValue({ joined: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.joinRoomAck(mockSocket as any, '1234');
        expect(result).toEqual({ joined: true });
    });

    it('should login', async () => {
        mockSocketService.canJoinRoom.mockReturnValue(true);
        mockSocketService.attemptLogin.mockReturnValue({ joined: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, 'test');
        expect(result).toEqual({ joined: true });
    });

    it('should not login with empty username', async () => {
        mockSocketService.canJoinRoom.mockReturnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, '');
        expect(result).toEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should not login when room is not open', async () => {
        mockSocketService.canJoinRoom.mockReturnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, '');
        expect(result).toEqual({ joined: false, message: GameEnum.ErrorMessage });
    });

    it('should update room', async () => {
        mockSocketService.getSocketsInRoom.mockResolvedValue([{ data: { username: 'test' } }]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.updateRoom(mockSocket as any);
        expect(result).toEqual([{ username: 'test' }]);
    });

    it('should update users', async () => {
        mockSocketService.getAllUsernamesInRoom.mockResolvedValue(['test']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.updateUsers(mockSocket as any);
        expect(result).toEqual(['test']);
    });

    it('should add user to banned list and make them leave the room', async () => {
        const mockUsername = 'bannedUser';
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockBannedSocket = { id: 'bannedSocketId', data: { room: '1234', username: mockUsername }, leave: jest.fn() };
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockSocket.data.room, mockRoom);
        mockSocketService.addToBannedList.mockImplementation();
        mockSocketService.getBannedSocket.mockResolvedValue(mockBannedSocket);
        jest.spyOn(gateway, 'leaveRoom').mockImplementation();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.banUser(mockSocket as any, mockUsername);
        expect(mockSocketService.addToBannedList).toHaveBeenCalledWith(mockRoom, mockUsername);
        expect(mockSocketService.getBannedSocket).toHaveBeenCalledWith(mockSocket, mockUsername);
        expect(gateway.leaveRoom).toHaveBeenCalledWith(mockBannedSocket);
    });

    it('should get user info', () => {
        const mockSocketUser = {
            data: {
                id: 'socketId',
                username: 'test',
                room: '1234',
                score: 0,
                bonus: 0,
                answered: false,
                firstToAnswer: false,
                hasLeft: false,
            },
        };
        jest.spyOn(gateway, 'getUserInfo').mockReturnValue(mockSocketUser);

        mockSocketService.getSocketsInRoom.mockResolvedValue(mockSocketUser);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = gateway.getUserInfo(mockSocket as any);
        expect(result).toEqual(mockSocketUser);
    });

    it('should check if all answered when leaving the room', () => {
        mockSocketGameManagerService.allAnswered.mockReturnValue(true);

        const mockRoomCode = 'room1';
        const mockUsername = 'testUser';
        const mockCustomSocket = {
            id: 'socketId',
            data: { room: mockRoomCode, username: mockUsername },
            leave: jest.fn(),
            emit: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.leaveRoom(mockCustomSocket as any);

        expect(mockSocketGameManagerService.allAnswered).toHaveBeenCalled();
        expect(gateway['server'].to).toHaveBeenCalledWith(mockRoomCode);
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.EndRound);
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.LeftRoom, mockUsername);
        expect(mockCustomSocket.leave).toHaveBeenCalledWith(mockRoomCode);
    });

    it('should delete the room and emit RoomClosed event', () => {
        const mockRoomCode = 'room1';

        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.destroyRoom(mockSocket as any);
        expect(gateway['rooms'].has(mockRoomCode)).toBeTruthy();
        expect(gateway['server'].to).toHaveBeenCalledWith('1');
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.RoomClosed);
    });

    it('should start game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.startGame(mockSocket as any);
        expect(mockSocketGameManagerService.startGame).toHaveBeenCalled();
    });

    it('should lock room', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;

        mockSocketService.updateLockRoom.mockImplementation((room: Room) => {
            room.isOpen = !room.isOpen;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.lockRoom(mockSocket as any);
        expect(mockSocketService.updateLockRoom).toHaveBeenCalled();
        expect(mockRoom.isOpen).toBeFalsy();
    });

    it('should unlock room', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;

        mockSocketService.updateLockRoom.mockImplementation((room: Room) => {
            room.isOpen = !room.isOpen;
        });
        mockSocket.data.room = mockRoomCode;
        mockSocket.data.username = 'fake';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.unlockRoom(mockSocket as any);
        expect(mockSocketService.updateLockRoom).toHaveBeenCalled();
        expect(mockRoom.isOpen).toBeTruthy();
    });

    it('should handle disconnect', async () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        mockSocketService.canDestroyRoom.mockResolvedValue(true);
        jest.spyOn(gateway, 'leaveRoom').mockImplementation();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.handleDisconnect(mockSocket as any);
        expect(mockSocketService.canDestroyRoom).toHaveBeenCalled();
        expect(gateway.leaveRoom).toHaveBeenCalled();
    });

    it('should not destroy room on handle disconnect', async () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        mockSocketService.canDestroyRoom.mockResolvedValue(false);
        jest.spyOn(gateway, 'leaveRoom').mockImplementation();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.handleDisconnect(mockSocket as any);
        expect(mockSocketService.canDestroyRoom).toHaveBeenCalled();
        expect(gateway.leaveRoom).toHaveBeenCalled();
    });

    it('should not leave room is socket.data.room is undefined', async () => {
        mockSocket.data.room = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.leaveRoom(mockSocket as any);
        const spy = jest.spyOn(gateway, 'leaveRoom');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should set server on module init', () => {
        gateway.onModuleInit();
        expect(mockSocketService.setServer).toHaveBeenCalledWith(mockServer);
        expect(mockSocketGameManagerService.setServer).toHaveBeenCalledWith(mockServer);
    });

    it('should emit when player gets muted', () => {
        const mockSocketUser: UserSocket = {
            data: {
                id: 'socketId',
                username: 'test',
                answered: false,
                isMuted: false,
            },
        };
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.muteUser(mockSocket as any, 'test');
        expect(mockServer.to).toHaveBeenCalledWith('socketId');
        expect(mockSocketUser.data.isMuted).toBe(true);
    });

    it('should emit when player state change', () => {
        const mockSocketUser: UserSocket = {
            data: {
                room: '0',
                id: 'socketId',
                username: 'test',
                answered: false,
                state: 0,
            },
        };
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.updatePlayerState(mockSocket as any, 2);
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.PlayerStateChange, mockSocketUser);
        expect(mockSocketUser.data.state).toBe(2);
    });

    it('should show result and populate history on end game', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        mockSocket.data.username = 'organisateur';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.endGame(mockSocket as any);

        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.ShowResults);
    });

    it('should finalize answer if round over', () => {
        const mockSocketUser: UserSocket = {
            data: {
                room: '0',
                id: 'socketId',
                username: 'organisateur',
                answered: false,
                state: 0,
            },
        };
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        mockSocketUser.data.state = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.roundOver(mockSocketUser as any, '0');
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.FinalizeAnswers);
    });

    it('should finalize answer if round over', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        mockSocketGameManagerService.finishQuestion.mockImplementation();
        const spy = jest.spyOn(mockSocketGameManagerService, 'finishQuestion');

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.roundOver(mockSocket as any, '0');
        expect(spy).toHaveBeenCalled();
    });

    it('should change question if next question is called', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.nextQuestion(mockSocket as any);
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.ChangeQuestion);
        expect(mockSocketService.resetUser).toHaveBeenCalledWith(mockRoom);
    });

    it('should go the QRL route if confirm answer QRL', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        mockSocketGameManagerService.canConfirmAnswer.mockResolvedValue(true);
        mockSocketGameManagerService.allAnswered.mockResolvedValue(true);
        mockSocketGameManagerService.checkAnswer.mockImplementation();
        mockSocketGameManagerService.getQuestionType.mockImplementation(() => {
            return 'QRL';
        });
        mockSocketService.findSocketUser.mockReturnValue(mockSocket);
        mockGameStats.questions[0] = {
            title: 'string',
            statLines: [],
            type: 'QRL',
            points: 0,
            timeFinished: false,
        };
        gateway.getAnswers = jest.fn();
        const spy = jest.spyOn(gateway, 'updatePlayerState');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.confirmAnswer(mockSocket as any, '0');
        expect(spy).toHaveBeenCalled();
    });

    it('should change state when user confirm and time not ended', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        mockSocketGameManagerService.canConfirmAnswer.mockResolvedValue(true);
        mockSocketGameManagerService.allAnswered.mockResolvedValue(true);
        mockSocketGameManagerService.checkAnswer.mockImplementation();
        mockSocketGameManagerService.getQuestionType.mockImplementation(() => {
            return 'QCM';
        });
        mockSocketService.findSocketUser.mockReturnValue(mockSocket);
        mockGameStats.questions[0] = {
            title: 'string',
            statLines: [],
            type: 'QCM',
            points: 0,
            timeFinished: false,
        };
        gateway.getAnswers = jest.fn();
        const spy = jest.spyOn(gateway, 'updatePlayerState');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.confirmAnswer(mockSocket as any, '0');
        expect(spy).toHaveBeenCalled();
    });

    it('should call sendMessage with the correct arguments', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const message = 'testMessage';
        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocketGameManagerService.isRoomValid.mockReturnValue(true);
        mockSocketGameManagerService.isMessageValid.mockReturnValue(true);
        gateway.sendMessage = jest.fn();
        gateway.handleRoomMessage(mockSocket as unknown as Socket, message);

        expect(mockSocketGameManagerService.isRoomValid).toHaveBeenCalledWith(gateway['rooms'], mockSocket as unknown as Socket);
        expect(gateway.sendMessage).toHaveBeenCalled();
    });

    it('handleRoomMessage should return if the room is invalid', () => {
        mockSocketGameManagerService.isRoomValid.mockReturnValue(false);
        gateway.sendMessage = jest.fn();
        gateway.handleRoomMessage(mockSocket as unknown as Socket, 'testMessage');
        expect(mockSocketGameManagerService.isRoomValid).toHaveBeenCalledWith(gateway['rooms'], mockSocket as unknown as Socket);
        expect(gateway.sendMessage).not.toHaveBeenCalled();
    });

    it('handleRoomMessage should return if message is invalid', () => {
        const mockSocketUser: UserSocket = {
            data: {
                id: 'socketId',
                username: 'test',
                answered: false,
                isMuted: false,
            },
        };
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        mockSocketGameManagerService.isRoomValid.mockReturnValue(true);
        mockSocketGameManagerService.isMessageValid.mockReturnValue(false);
        gateway.sendMessage = jest.fn();
        gateway.handleRoomMessage(mockSocket as unknown as Socket, 'testMessage');
        expect(mockSocketGameManagerService.isMessageValid).toHaveBeenCalledWith('testMessage');
        expect(gateway.sendMessage).not.toHaveBeenCalled();
    });

    it('handleRoomMessage should return if the user is muted', () => {
        const mockSocketUser: UserSocket = {
            data: {
                id: 'socketId',
                username: 'test',
                answered: false,
                isMuted: true,
            },
        };
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        mockSocketGameManagerService.isRoomValid.mockReturnValue(true);
        gateway.sendMessage = jest.fn();
        gateway.handleRoomMessage(mockSocket as unknown as Socket, 'testMessage');
        expect(mockSocketGameManagerService.isRoomValid).toHaveBeenCalledWith(gateway['rooms'], mockSocket as unknown as Socket);
        expect(gateway.sendMessage).not.toHaveBeenCalled();
    });

    it('sendMessage should emit the message and add it to room message list', () => {
        const message = 'testMessage';
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['server'].to = jest.fn().mockReturnValue({
            emit: jest.fn(),
        });

        gateway.sendMessage(mockSocket as unknown as Socket, message);
        expect(gateway['server'].to).toHaveBeenCalledWith(mockRoomCode);
        expect(gateway['server'].to(mockRoomCode).emit).toHaveBeenCalledWith(GameEvents.SendMessage, message);
    });

    it('should return all room messages if room exists', () => {
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        const result = gateway.getAllMessages(mockSocket as unknown as Socket);

        expect(result).toEqual(mockRoom.roomMessages);
    });

    it('should call addAnswer and getAnswers with the correct arguments and update player state', () => {
        const mockSocketUser: UserSocket = {
            data: {
                room: '0',
                id: 'socketId',
                username: 'test',
                answered: false,
                state: 0,
            },
        };
        const mockAnswer: Answer = {
            questionIndex: 1,
            answer: 1,
        };
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        mockSocketGameManagerService.addAnswer = jest.fn();
        gateway.getAnswers = jest.fn();
        const spy = jest.spyOn(gateway, 'updatePlayerState');
        gateway.addAnswer(mockSocket as unknown as Socket, mockAnswer);

        expect(spy).toHaveBeenCalled();
        expect(mockSocketGameManagerService.addAnswer).toHaveBeenCalledWith(mockSocket, mockAnswer, gateway['rooms']);
        expect(gateway.getAnswers).toHaveBeenCalledWith(mockSocket, mockAnswer.questionIndex);
    });

    it('should call server.to.emit with the correct arguments if room exists', () => {
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        const questionIndex = 1;
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        gateway['server'].to = jest.fn().mockReturnValue({
            emit: jest.fn(),
        });

        gateway.getAnswers(mockSocket as unknown as Socket, questionIndex);

        expect(gateway['server'].to).toHaveBeenCalledWith(mockRoomCode);
        expect(gateway['server'].to(mockRoomCode).emit).toHaveBeenCalledWith(GameEvents.GetAnswers, mockRoom.gameStats.questions[questionIndex]);
    });

    it('should return gameStats if room exists', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        const result = gateway.getStats(mockSocket as unknown as Socket);

        expect(result).toEqual(mockRoom.gameStats);
    });

    it('should return socket data', () => {
        const mockSocketData = mockSocket.data;
        const result = gateway.getUserInfo(mockSocket as unknown as Socket);
        expect(result).toEqual(mockSocketData);
    });

    it('should return true or false if socket is in random room or not', () => {
        let result = gateway.getRandom(mockSocket as unknown as Socket);
        expect(result).toEqual(null);
        mockSocket.data.room = '0';
        gateway['rooms'].set('0', { isRandom: true } as unknown as Room);
        result = gateway.getRandom(mockSocket as unknown as Socket);
        expect(result).toEqual(true);
    });

    it('should pause the timer', () => {
        gateway['rooms'] = new Map();
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        gateway['rooms'].set('1234', mockRoom);
        mockSocket.data.room = '1234';

        gateway.pauseTimer(mockSocket as unknown as Socket);
        expect(mockSocketTimeManagerService.pauseTimer).toHaveBeenCalledWith(gateway['rooms'].get('1234'), '1234');
    });

    it('should start panic mode', () => {
        gateway['rooms'] = new Map();
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        gateway['rooms'].set('1234', mockRoom);
        mockSocket.data.room = '1234';
        const timeLeft = 50;
        const questionIndex = 0;
        mockSocketTimeManagerService.panicTimer.mockReturnValue(true);
        gateway.panicMode(mockSocket as unknown as Socket, { questionIndex: 0, timeLeft });
        expect(mockSocketTimeManagerService.panicTimer).toHaveBeenCalledWith(gateway['rooms'].get('1234'), '1234', timeLeft, questionIndex);
        expect(gateway['server'].to).toHaveBeenCalledWith('1234');
    });

    describe('startGame', () => {
        it('should set the startingTime for the room when the game starts', () => {
            // Mock a room and its starting state
            const mockRoom: Room = {
                isOpen: true,
                bannedUsers: [],
                gameStats: mockGameStats,
                isStarted: false,
                isPaused: false,
                delayTick: 1000,
                roomMessages: [],
                startingTime: '',
                timer: undefined,
                socketTimers: new Map(),
            };

            // Set the room in the gateway's rooms Map
            gateway['rooms'].set(mockSocket.data.room, mockRoom);

            // Call startGame method with the mock socket
            gateway.startGame(mockSocket as unknown as Socket);

            // Get the room after the method call to check if startingTime was set
            const updatedRoom = gateway['rooms'].get(mockSocket.data.room);

            // Check if startingTime was updated
            expect(updatedRoom.startingTime).not.toBe('');
            expect(new Date(updatedRoom.startingTime)).toBeInstanceOf(Date);
        });
    });

    it('should send Text to user if sendTextAnswer socket is called', () => {
        const mockSocketUser: UserSocket = {
            data: {
                room: '0',
                id: 'socketId',
                username: 'test',
                answered: false,
                state: 0,
            },
        };
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        const spy = jest.spyOn(gateway, 'sendTextAnswer');
        gateway.sendTextAnswer(mockSocket as unknown as Socket, 'testText');

        expect(spy).toHaveBeenCalled();
        expect(mockSocketUser.data.textAnswer).toEqual('testText');
    });

    it('should return textAnswers if room exists', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocketService.getTextsFromRoom.mockReturnValue(['lol', 'xD']);
        const spy = jest.spyOn(mockSocketService, 'getTextsFromRoom');
        gateway.getTextAnswers(mockSocket as unknown as Socket);

        expect(spy).toHaveBeenCalled();
    });

    it('should changeQrlQuestion if room exists', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocketService.changeQrlStatlines.mockImplementation();
        const spy = jest.spyOn(mockSocketService, 'changeQrlStatlines');
        gateway.changeQrlQuestion(mockSocket as unknown as Socket, '0');

        expect(spy).toHaveBeenCalled();
    });

    it('should givePoints', () => {
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        const mockGivePointsInfo: GivePointsInfo = {
            pointsGiven: 0,
            username: 'john',
            percentageGiven: '0%',
            questionIndex: 0,
        };
        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        const spy = jest.spyOn(mockSocketGameManagerService, 'givePoints');
        gateway.givePoints(mockSocket as unknown as Socket, mockGivePointsInfo);

        expect(spy).toHaveBeenCalled();
    });

    it('should endCorrection and emit EndRound', () => {
        const mockRoomCode = 'room1';

        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        gateway.getAnswers = jest.fn();
        gateway['server'].to = jest.fn().mockReturnValue({
            emit: jest.fn(),
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.endCorrection(mockSocket as any, '0');
        expect(gateway.getAnswers).toHaveBeenCalledWith(mockSocket, 0);
    });

    it('should change user activity on makeUserActive socket call', () => {
        const mockSocketUser: UserSocket = {
            data: {
                room: '0',
                id: 'socketId',
                username: 'test',
                answered: false,
                state: 1,
            },
        };
        // eslint-disable-next-line
        const mockTimer = setInterval(() => {}, 1000);
        const mockRoom: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
            isPaused: false,
            delayTick: 1000,
            timer: setInterval(() => {
                mockServer.to('1234').emit(GameClientEvents.Tick, {});
            }, DEFAULT_DELAY),
            startingTime: '',
            socketTimers: new Map(),
        };
        mockRoom.socketTimers.set('test', mockTimer);

        const mockRoomCode = '1234';
        mockSocket.data.room = mockRoomCode;
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        jest.useFakeTimers();
        mockSocketService.findSocketUser.mockReturnValue(mockSocketUser);
        mockSocketService.wereStatlinesChanged.mockReturnValue(false);
        mockSocketService.findNameInStatLine.mockReturnValue(false);
        gateway.getAnswers = jest.fn();
        const spy = jest.spyOn(gateway, 'updatePlayerState');

        gateway.makeUserActive(mockSocket as unknown as Socket, '0');
        // eslint-disable-next-line
        jest.advanceTimersByTime(5000);
        expect(gateway.getAnswers).toHaveBeenCalledWith(mockSocket, 0);
        expect(gateway.updatePlayerState).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
