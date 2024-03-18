import { Room } from '@app/model/socket/socket.schema';
import { FAKE_GAME_STAT, FAKE_QUESTION_STAT } from '@app/model/stats/stats.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameClientEvents, GameEnum } from './game.gateway.events';
/* eslint-disable max-lines */

describe('GameGateway', () => {
    let gateway: GameGateway;

    const mockQuizService = {
        generateRandomID: jest.fn(),
        populateGameStats: jest.fn(),
    };

    const mockSocketService = {
        getSocketsInRoom: jest.fn(),
        getAllUsernamesInRoom: jest.fn(),
        isUserValid: jest.fn(),
        isLoginValid: jest.fn(),
    };

    const mockSocket = {
        id: 'socketId',
        data: { room: '1', username: 'test' },
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        except: jest.fn().mockReturnThis(),
        sockets: {
            sockets: new Map(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGateway, { provide: QuizService, useValue: mockQuizService }, { provide: SocketService, useValue: mockSocketService }],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway['server'] = mockServer as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should create a room', async () => {
        const roomCode = '1234';
        mockQuizService.generateRandomID.mockReturnValue(roomCode);
        mockQuizService.populateGameStats.mockReturnValue({
            id: '',
            questions: [],
            users: [],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await gateway.createRoom(mockSocket as any, '123456');

        expect(mockSocket.join).toHaveBeenCalledWith(roomCode);
        expect(mockSocket.data.room).toBe(roomCode);
        expect(mockSocket.data.username).toBe('organisateur');
    });

    it('should acknowledge room join', () => {
        const roomCode = '1234';
        gateway['rooms'].set(roomCode, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = gateway.joinRoomAck(mockSocket as any, roomCode);
        expect(result).toStrictEqual({ joined: true });
        expect(mockSocket.join).toHaveBeenCalledWith(roomCode);
    });

    it('should handle login', async () => {
        const username = 'testUser';
        const roomCode = '1234';
        mockSocket.data.room = roomCode;
        mockSocketService.isUserValid.mockReturnValue(true);
        mockSocketService.isLoginValid.mockReturnValue(true);
        mockSocketService.getSocketsInRoom.mockResolvedValue([]);

        gateway['rooms'].set(roomCode, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, username);
        expect(result).toStrictEqual({ joined: true });
        expect(mockServer.to).toHaveBeenCalledWith(mockSocket.data.room);
        expect(mockServer.except).toHaveBeenCalledWith(mockSocket.id);
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.JoinedRoom, mockSocket.data);
    });

    it('should not acknowledge room join if room does not exist', () => {
        const roomCode = '1234';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = gateway.joinRoomAck(mockSocket as any, roomCode);
        expect(result).toStrictEqual({ joined: false, message: GameEnum.ErrorMessage });
    });

    it('should not handle login for invalid user', async () => {
        const username = 'invalidUser';
        gateway['rooms'].set('1234', {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });
        mockSocketService.isUserValid.mockReturnValue(false);
        mockSocketService.isLoginValid.mockReturnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, username);
        expect(result).toStrictEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should not handle login for invalid username', async () => {
        const username = '';
        gateway['rooms'].set('1234', {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });
        mockSocketService.isUserValid.mockReturnValue(true);
        mockSocketService.isLoginValid.mockReturnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, username);
        expect(result).toStrictEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should not handle login for invalid room', async () => {
        const username = 'validUser1';
        gateway['rooms'].set('1235', {
            roomMessages: [],
            isOpen: false,
            isStarted: false,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });
        mockSocketService.isUserValid.mockReturnValue(false);
        mockSocketService.isLoginValid.mockReturnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.login(mockSocket as any, username);
        expect(result).toStrictEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should update room', async () => {
        const room = '1234';
        mockSocket.data.room = room;
        const mockUsers = [{ data: { username: 'user1' } }];
        const expectedData = mockUsers.map((user) => user.data);

        mockSocketService.getSocketsInRoom.mockResolvedValue(mockUsers);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gateway.updateRoom(mockSocket as any);
        expect(result).toEqual(expectedData);
    });

    it('should handle leave room', () => {
        const roomCode = '1234';
        mockSocket.data.room = roomCode;
        mockSocket.data.username = 'testUser';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.leaveRoom(mockSocket as any);

        expect(mockSocket.leave).toHaveBeenCalledWith(roomCode);
        const leftRoomEmitCall = mockServer.emit.mock.calls[1];
        expect(leftRoomEmitCall[0]).toBe(GameClientEvents.LeftRoom);
        expect(leftRoomEmitCall[1]).toBe('testUser');
        mockSocket.data.room = undefined;
        mockSocket.data.username = undefined;
    });

    it('should handle disconnect', () => {
        const roomCode = '1234';
        mockSocket.data.username = 'testUser';
        mockSocket.data.room = roomCode;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.handleDisconnect(mockSocket as any);

        expect(mockServer.to).toHaveBeenCalledWith(roomCode);
        expect(mockServer.emit.mock.calls[1][1]).toBe('testUser');

        mockSocket.data.room = undefined;
        mockSocket.data.username = undefined;
    });

    it('should handle disconnect for organizer', () => {
        const roomCode = '1234';
        mockSocket.data.room = roomCode;
        mockSocket.data.username = 'Organisateur';
        gateway['rooms'].set(roomCode, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.handleDisconnect(mockSocket as any);
        expect(gateway['rooms'].has(roomCode)).toBe(false);
        expect(mockServer.to).toHaveBeenCalledWith(roomCode);
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.RoomClosed);

        mockSocket.data.username = 'test';
    });

    it('should add an answer to a question', () => {
        const roomCode = '1234';
        const answer = 0;
        const questionIndex = 0;
        const gameStats = FAKE_GAME_STAT;
        gameStats.questions.push(FAKE_QUESTION_STAT);
        gateway['rooms'].set(roomCode, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: FAKE_GAME_STAT,
        });
        mockSocket.data.room = roomCode;
        mockSocket.data.username = 'fake';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.addAnswer(mockSocket as any, { answer, questionIndex });

        const room = gateway['rooms'].get(roomCode);
        expect(room.gameStats.questions[questionIndex].statLines[answer].users).toContain('fake');
    });

    it('should destroy a room', () => {
        const roomCode = '1234';
        gateway['rooms'].set(roomCode, {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: {
                id: '',
                duration: 0,
                questions: [],
                users: [],
                name: '',
            },
            isStarted: false,
        });
        mockSocket.data.room = roomCode;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.destroyRoom(mockSocket as any);

        expect(gateway['rooms'].has(roomCode)).toBe(false);
        expect(mockServer.to).toHaveBeenCalledWith(roomCode);
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.RoomClosed);
    });

    it('should ban a user and make them leave the room', async () => {
        const roomCode = '1234';
        const usernameToBan = 'userToBan';
        const mockBannedSocket = { ...mockSocket, data: { username: usernameToBan, room: roomCode, id: 'bannedSocketId' } };
        const mockRoom = { bannedUsers: [], isOpen: true, gameStats: FAKE_GAME_STAT, isStarted: false };

        gateway['rooms'].set(roomCode, mockRoom as unknown as Room);

        mockSocketService.getSocketsInRoom.mockResolvedValue([mockBannedSocket]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gateway.banUser(mockSocket as any, usernameToBan);
        expect(mockRoom.bannedUsers).toContain(usernameToBan.toLowerCase());
        expect(mockSocketService.getSocketsInRoom).toHaveBeenCalledWith(roomCode, mockServer);
    });

    it('should get user info', async () => {
        const roomCode = '1234';
        mockSocket.data.room = roomCode;
        mockSocket.data.username = 'testUser';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = gateway.getUserInfo(mockSocket as any);
        expect(result).toStrictEqual(mockSocket.data);
    });
});
