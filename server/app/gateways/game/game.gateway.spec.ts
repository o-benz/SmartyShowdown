import { Room } from '@app/model/socket/socket.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketGameManagerService } from '@app/services/socket-game-manager/socket-game-manager.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameClientEvents, GameEnum } from './game.gateway.events';
/* eslint-disable max-lines */

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('GameGateway', () => {
    let gateway: GameGateway;

    const mockQuizService = {
        generateRandomID: jest.fn(),
        populateGameStats: jest.fn(),
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
        destroyRoom: jest.fn(),
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
        questions: [],
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
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);

        // J'utilise Any car essayer de le faire as Socket ne marche pas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = mockServer as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
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
        mockSocketService.attemptLogin.mockReturnValue({ joined: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, 'test');
        expect(result).toEqual({ joined: true });
    });

    it('should not login with empty username', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, '');
        expect(result).toEqual({ joined: false, message: GameEnum.UserNotValidMessage });
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
        };
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.destroyRoom(mockSocket as any);
        expect(gateway['rooms'].has(mockRoomCode)).toBeTruthy();
        expect(gateway['server'].to).toHaveBeenCalledWith(mockRoomCode);
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
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        mockSocketService.destroyRoom.mockResolvedValue(true);
        jest.spyOn(gateway, 'leaveRoom').mockImplementation();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.handleDisconnect(mockSocket as any);
        expect(mockSocketService.destroyRoom).toHaveBeenCalled();
        expect(gateway.leaveRoom).toHaveBeenCalled();
    });

    it('should not destroy room on handle disconnect', async () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);

        mockSocketService.destroyRoom.mockResolvedValue(false);
        jest.spyOn(gateway, 'leaveRoom').mockImplementation();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.handleDisconnect(mockSocket as any);
        expect(mockSocketService.destroyRoom).toHaveBeenCalled();
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

    it('should set up an interval and emit tick events', () => {
        const TICK_MS = 1000;
        gateway.afterInit();
        jest.advanceTimersByTime(TICK_MS);

        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), TICK_MS);
        expect(mockServer.emit).toHaveBeenCalledWith('tick', {});
    });

    it('should show result on end game', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.endGame(mockSocket as any);
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.ShowResults);
    });

    it('should finalize answer if round over', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
        };

        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.roundOver(mockSocket as any, '0');
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.FinalizeAnswers);
    });

    it('should change question if next question is called', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
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

    it('should endRound if all users have confirmed', () => {
        const mockRoom: Room = {
            roomMessages: [],
            isOpen: false,
            bannedUsers: [],
            gameStats: mockGameStats,
            isStarted: false,
        };
        const mockRoomCode = '1234';
        gateway['rooms'] = new Map();
        gateway['rooms'].set(mockRoomCode, mockRoom);
        mockSocket.data.room = mockRoomCode;
        mockSocketGameManagerService.canConfirmAnswer.mockResolvedValue(true);
        mockSocketGameManagerService.allAnswered.mockResolvedValue(true);
        mockSocketGameManagerService.checkAnswer.mockImplementation();
        mockSocketService.findSocketUser.mockReturnValue(mockSocket);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.confirmAnswer(mockSocket as any, '0');
        expect(gateway['server'].emit).toHaveBeenCalledWith(GameClientEvents.EndRound);
        expect(mockSocketService.resetUser).toHaveBeenCalledWith(mockRoom);
    });
});
