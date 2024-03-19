import { GameClientEvents, GameEnum } from '@app/gateways/game/game.gateway.events';
import { BONUS_MULTIPLIER } from '@app/model/quiz/quiz.schema';
import { Answer, Room, UserSocket } from '@app/model/socket/socket.schema';
import { Server, Socket } from 'socket.io';
import { SocketGameManagerService } from './socket-game-manager.service';

describe('SocketGameManager', () => {
    let service: SocketGameManagerService;
    let mockSocket: Socket;
    let mockRoom: Room;
    let mockUserSocket: UserSocket;
    let mockAnswer: Answer;
    let mockServer: Server;

    beforeEach(() => {
        service = new SocketGameManagerService();
        mockSocket = {
            emit: jest.fn(),
            data: {
                room: 'room',
                username: 'username',
            },
        } as unknown as Socket;
        mockRoom = {
            gameStats: {
                questions: [{ statLines: [{ label: 'label', users: [] }], points: 0, title: 'title', type: 'type' }],
                users: [],
            },
            roomMessages: [],
        } as Room;
        mockUserSocket = {
            data: {
                username: 'username',
                answered: false,
                hasLeft: false,
            },
        } as UserSocket;
        mockAnswer = {
            questionIndex: 0,
            answer: 0,
        } as Answer;
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            sockets: {
                sockets: new Map(),
            },
        } as unknown as Server;
        service.setServer(mockServer);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('addAnswer should return early if  the room does not exist', () => {
        const rooms = new Map();
        service.addAnswer(mockSocket, mockAnswer, rooms);
        expect(rooms.size).toEqual(0);
    });

    it('addAnswer should return early if the question does not exist', () => {
        mockRoom.gameStats.questions = [];
        const rooms = new Map([['room', mockRoom]]);
        service.addAnswer(mockSocket, mockAnswer, rooms);
        expect(rooms.get('room')).toEqual(mockRoom);
    });

    it('addAnswer should remove the user from the answer if they have already answered', () => {
        mockRoom.gameStats.questions[0].statLines[0].users = ['username'];
        const rooms = new Map([['room', mockRoom]]);
        service.addAnswer(mockSocket, mockAnswer, rooms);
        expect(rooms.get('room').gameStats.questions[0].statLines[0].users).toEqual([]);
    });

    it('addAnswer should add the username to the users list if it is not already there', () => {
        mockRoom.gameStats.questions[0].statLines[0].users = [];
        const rooms = new Map([['room', mockRoom]]);
        service.addAnswer(mockSocket, mockAnswer, rooms);
        expect(rooms.get('room').gameStats.questions[0].statLines[0].users).toEqual(['username']);
    });

    it('addAnswer should return early if the room does not exist', () => {
        const rooms = new Map();
        service.addAnswer(mockSocket, mockAnswer, rooms);
        expect(rooms.size).toEqual(0);
    });

    it('allAnswered should return true if all users have answered', () => {
        mockRoom.gameStats.users = [mockUserSocket, mockUserSocket];
        mockUserSocket.data.answered = true;
        expect(service.allAnswered(mockRoom)).toEqual(true);
    });

    it('allAnswered should return false if not all users have answered', () => {
        mockRoom.gameStats.users = [mockUserSocket, mockUserSocket];
        mockUserSocket.data.answered = false;
        expect(service.allAnswered(mockRoom)).toEqual(false);
    });

    it('allAnswered should return early if the room does not exist', () => {
        expect(service.allAnswered(null)).toEqual(undefined);
    });

    it('canConfirmAnswer should return false if the user does not exist', () => {
        expect(service.canConfirmAnswer(null)).toEqual(false);
        expect(service.canConfirmAnswer(undefined)).toEqual(false);
    });

    it('canConfirmAnswer should return false if the user has already answered', () => {
        mockUserSocket.data.answered = true;
        expect(service.canConfirmAnswer(mockUserSocket)).toEqual(false);
    });

    it('canConfirmAnswer should return true if the user has not answered', () => {
        mockUserSocket.data.answered = false;
        expect(service.canConfirmAnswer(mockUserSocket)).toEqual(true);
    });

    it('finishQuestion should set the timeFinished property to true', () => {
        service.finishQuestion(mockRoom, '0');
        expect(mockRoom.gameStats.questions[0].timeFinished).toEqual(true);
    });

    it('startGame should start the game if the room is not open, there is at least one player, and the user is the organizer', () => {
        const secondMockUserSocket = { data: { username: GameEnum.Organizer } };
        mockRoom.isOpen = false;
        mockRoom.gameStats.users = [mockUserSocket];
        service.startGame(mockRoom, secondMockUserSocket as Socket);
        expect(mockRoom.isStarted).toEqual(true);
    });

    it('startGame should emit a GameStarted event if the game is started', () => {
        const secondMockUserSocket = { data: { username: GameEnum.Organizer } };
        mockRoom.isOpen = false;
        mockRoom.gameStats.users = [mockUserSocket];
        service.startGame(mockRoom, secondMockUserSocket as Socket);
        expect(mockServer.emit).toHaveBeenCalledWith(GameClientEvents.GameStarted);
    });

    it('startGame should emit a GameStartResponse event if the game is not started', () => {
        mockRoom.isOpen = true;
        mockRoom.gameStats.users = [mockUserSocket];
        service.startGame(mockRoom, mockSocket);
        expect(mockSocket.emit).toHaveBeenCalledWith(GameClientEvents.GameStartResponse, {
            joined: false,
            message: GameEnum.OnlyOrganizerCanStart,
        });
    });

    it('startGame should emit a GameStartResponse event if the room is empty', () => {
        mockSocket.data.username = GameEnum.Organizer;
        mockRoom.isOpen = true;
        mockRoom.gameStats.users = [];
        service.startGame(mockRoom, mockSocket);
        expect(mockSocket.emit).toHaveBeenCalledWith(GameClientEvents.GameStartResponse, {
            joined: false,
            message: GameEnum.RoomLockedOrEmpty,
        });
    });

    it('startGame should not start the game if the user is not the organizer', () => {
        mockRoom.isOpen = false;
        mockRoom.gameStats.users = [mockUserSocket];
        service.startGame(mockRoom, mockSocket);
        expect(mockRoom.isStarted).toEqual(undefined);
    });

    it('startGame should emit a GameStartResponse event with RoomLockedOrEmpty message if room.gameStats is undefined', () => {
        mockRoom = undefined;
        mockSocket.data.username = GameEnum.Organizer;
        mockSocket.data.room = 'room1';
        service.startGame(mockRoom, mockSocket);
        expect(mockSocket.emit).toHaveBeenCalledWith(GameClientEvents.GameStartResponse, {
            joined: false,
            message: GameEnum.RoomLockedOrEmpty,
        });
    });

    it('addPoints should add bonus points to the user and increment the bonus count', () => {
        const mockUserInStats = { data: { firstToAnswer: false, bonus: 0 } } as UserSocket;
        mockSocket.data.score = 0;
        mockSocket.data.bonus = 0;
        const questionPoints = 10;
        service.addPoints(mockUserInStats, mockSocket, questionPoints);
        expect(mockSocket.data.score).toEqual(BONUS_MULTIPLIER * questionPoints);
        expect(mockSocket.data.bonus).toEqual(1);
        expect(mockUserInStats.data.bonus).toEqual(1);
        expect(mockUserInStats.data.firstToAnswer).toEqual(true);
    });

    it('isFirstToAnswer should return true if no user has answered and the question is not finished', () => {
        mockRoom.gameStats.users = [mockUserSocket, mockUserSocket];
        mockRoom.gameStats.questions[0].timeFinished = false;
        expect(service.isFirstToAnswer(mockRoom, mockRoom.gameStats, 0)).toEqual(true);
    });

    it('isFirstToAnswer should return false if a user has answered', () => {
        mockRoom.gameStats.users = [mockUserSocket, mockUserSocket];
        mockRoom.gameStats.questions[0].timeFinished = false;
        mockRoom.gameStats.users[0].data.firstToAnswer = true;
        expect(service.isFirstToAnswer(mockRoom, mockRoom.gameStats, 0)).toEqual(false);
    });

    it('isFirstToAnswer should return true if the user is the only one in the room', () => {
        mockRoom.gameStats.users = [mockUserSocket];
        mockRoom.gameStats.questions[0].timeFinished = true;
        expect(service.isFirstToAnswer(mockRoom, mockRoom.gameStats, 0)).toEqual(true);
    });

    it('checkAnswers should not add points if the user did not answer correctly', () => {
        mockRoom.gameStats.questions[0].statLines = [{ label: 'some label', users: ['username'], isCorrect: false }];
        mockRoom.gameStats.questions[0].points = 10;
        mockSocket.data.score = 0;
        service.checkAnswers(mockSocket, 0, mockRoom);
        expect(mockSocket.data.score).toEqual(0);
    });

    it('checkAnswers should add points if the user answered correctly', () => {
        const expectedScore = 10;
        mockRoom.gameStats.questions[0].statLines = [{ label: 'some label', users: ['username'], isCorrect: true }];
        mockRoom.gameStats.questions[0].points = expectedScore;
        mockSocket.data.score = 0;
        service.checkAnswers(mockSocket, 0, mockRoom);
        expect(mockSocket.data.score).toEqual(expectedScore);
    });

    it('checkAnswers should add bonus points if the user is the first to answer', () => {
        const expectedScore = 10;
        mockRoom.gameStats.questions[0].statLines = [{ label: 'some label', users: ['username'], isCorrect: true }];
        mockRoom.gameStats.questions[0].points = expectedScore;
        mockRoom.gameStats.users = [mockUserSocket];
        mockSocket.data.score = 0;
        service.checkAnswers(mockSocket, 0, mockRoom);
        expect(mockSocket.data.score).toEqual(expectedScore + BONUS_MULTIPLIER * expectedScore);
    });

    it('checkAnswers should not increment rightAnswerCount if user is not in line.users', () => {
        mockSocket.data.score = 0;
        mockUserSocket.data.score = 0;
        mockRoom.gameStats.questions[0].statLines = [{ label: 'some label', users: ['differentUsername'], isCorrect: true }];
        mockRoom.gameStats.questions[0].points = 10;
        mockRoom.gameStats.users = [mockUserSocket];
        service.checkAnswers(mockSocket, 0, mockRoom);
        expect(mockSocket.data.score).toEqual(0);
        expect(mockRoom.gameStats.users[0].data.score).toEqual(0);
    });

    it('isRoomValid should return true if room code is not provided', () => {
        const mockRooms = new Map();
        mockSocket.data.room = null;
        const result = service.isRoomValid(mockRooms, mockSocket);
        expect(result).toEqual(true);
    });

    it('isRoomValid should return true if room code is provided but room does not exist', () => {
        const mockRooms = new Map();
        const result = service.isRoomValid(mockRooms, mockSocket);
        expect(result).toEqual(true);
    });

    it('isRoomValid should return false if room code is provided and room exists', () => {
        const mockRooms = new Map([['room', mockRoom]]);
        mockSocket.data.room = 'room';
        const result = service.isRoomValid(mockRooms, mockSocket);
        expect(result).toEqual(false);
    });

    it('isMessageValid should return false if message is null', () => {
        expect(service.isMessageValid(null)).toEqual(false);
    });

    it('isMessageValid should return false if message is an empty string', () => {
        expect(service.isMessageValid('')).toEqual(false);
    });

    it('isMessageValid should return false if message is a string of spaces', () => {
        expect(service.isMessageValid('   ')).toEqual(false);
    });

    it('isMessageValid should return true if message is a non-empty string', () => {
        expect(service.isMessageValid('Hello, world!')).toEqual(true);
    });

    it('handleRoomMessage should add the message to the room messages', () => {
        mockRoom.roomMessages = [];
        const message = 'Hello, world!';
        service.handleRoomMessage(mockRoom, message);
        expect(mockRoom.roomMessages).toContain(message);
    });
});
