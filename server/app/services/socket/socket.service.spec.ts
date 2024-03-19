import { GameClientEvents, GameEnum } from '@app/gateways/game/game.gateway.events';
import { Room, UserSocket } from '@app/model/socket/socket.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
/* eslint max-lines: "off" */

describe('SocketService', () => {
    let socketService: SocketService;

    const mockGameStats: GameStats = {
        id: '',
        duration: 10,
        questions: [],
        users: [],
        name: '',
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        except: jest.fn().mockReturnThis(),
        sockets: {
            sockets: new Map(),
        },
        in: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
        socketService = new SocketService();
        // J'utilise Any car essayer de le faire as Socket ne marche pas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketService['server'] = mockServer as any;
    });

    it('should set server', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketService.setServer(mockServer as any);
        expect(socketService['server']).toEqual(mockServer);
    });

    it('should return true for a valid non-organizer user', () => {
        const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
        expect(socketService.isUserValid('newuser', users)).toBe(true);
    });

    it('should return false for the organizer username', () => {
        const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
        expect(socketService.isUserValid('organisateur', users)).toBe(false);
    });

    it('should return true for a unique username', () => {
        const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
        expect(socketService.isUniqueUsername('user3', users)).toBe(true);
    });

    it('should return false for a non-unique username', () => {
        const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
        expect(socketService.isUniqueUsername('user1', users)).toBe(false);
    });

    it('should return true for a non-organizer username', () => {
        expect(socketService.isNotOrganizer('user')).toBe(true);
    });

    it('should return false for the organizer username', () => {
        expect(socketService.isNotOrganizer('organisateur')).toBe(false);
    });

    it('should fetch sockets in a room', async () => {
        const room = 'testRoom';
        const mockSockets: Partial<Socket>[] = [{ id: '1' }, { id: '2' }];
        mockServer.in(room).fetchSockets = jest.fn().mockResolvedValue(mockSockets);

        const result = await socketService.getSocketsInRoom(room);
        expect(mockServer.in).toHaveBeenCalledWith(room);
        expect(mockServer.in(room).fetchSockets).toHaveBeenCalled();
        expect(result).toEqual(mockSockets);
    });

    it('should return all usernames in a room', async () => {
        const room = 'testRoom';
        const mockSockets = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
        mockServer.in(room).fetchSockets = jest.fn().mockResolvedValue(mockSockets);

        const result = await socketService.getAllUsernamesInRoom(room);
        expect(mockServer.in).toHaveBeenCalledWith(room);
        expect(mockServer.in(room).fetchSockets).toHaveBeenCalled();
        expect(result).toEqual(['user1', 'user2']);
    });

    it('should return true for a valid login', () => {
        const room = 'testRoom';
        const username = 'user1';
        const rooms = new Map<string, Room>();
        rooms.set(room, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: mockGameStats,
        });

        const mockSocket = { data: { room } } as unknown as Socket;
        expect(socketService.isLoginValid(rooms, mockSocket, username)).toBe(true);
    });

    it('should return false for a login in a non-existent room', () => {
        const room = 'nonExistentRoom';
        const username = 'user1';
        const rooms = new Map<string, Room>();

        const mockSocket = { data: { room } } as unknown as Socket;
        expect(socketService.isLoginValid(rooms, mockSocket, username)).toBe(false);
    });

    it('should return false for a banned user', () => {
        const room = 'testRoom';
        const username = 'user2';
        const rooms = new Map<string, Room>();
        rooms.set(room, {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: ['user2'],
            gameStats: mockGameStats,
        });

        const mockSocket = { data: { room } } as unknown as Socket;
        expect(socketService.isLoginValid(rooms, mockSocket, username)).toBe(false);
    });

    it('should get all usernames in a room', async () => {
        socketService.getSocketsInRoom = jest
            .fn()
            .mockResolvedValue([{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }]);

        expect(await socketService.getAllUsernamesInRoom('testRoom')).toEqual(['user1', 'user2']);
    });

    it('should get all messages in a room', async () => {
        const room: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: mockGameStats,
        };

        expect(await socketService.getAllMessages(room)).toEqual(['message1', 'message2']);
    });

    it('should add a message to a room', () => {
        const room: Room = {
            roomMessages: ['message1', 'message2'],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: mockGameStats,
        };

        socketService.addMessageToRoom(room, 'message3');
        expect(room.roomMessages).toEqual(['message1', 'message2', 'message3']);
    });

    it('should populate a room', () => {
        const mockSocket = {
            id: 'socketId',
            data: { room: '1', username: 'test' },
        };
        const rooms = new Map<string, Room>();
        socketService.populateRoom(rooms, mockSocket as unknown as Socket);
        expect(rooms.get('1')).toEqual({
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: undefined,
        });
    });

    it('should initialize an organizer socket', () => {
        const mockSocket = {
            id: 'socketId',
            data: { room: '1', username: 'test' },
        };
        socketService.initializeOrganizerSocket(mockSocket as unknown as Socket, '1234');
        expect(mockSocket.data).toEqual({ room: '1234', id: 'socketId', username: 'organisateur' });
    });

    it('should be able to join room', () => {
        const rooms = new Map<string, Room>();
        rooms.set('1', {
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: undefined,
        });
        expect(socketService.canJoinRoom(rooms, '1')).toBe(true);
    });

    it('should not be able to join a non-existent room', () => {
        const rooms = new Map<string, Room>();
        expect(socketService.canJoinRoom(rooms, '1')).toBe(false);
    });

    it('should not be able to join a closed room', () => {
        const rooms = new Map<string, Room>();
        rooms.set('1', {
            roomMessages: [],
            isOpen: false,
            isStarted: false,
            bannedUsers: [],
            gameStats: undefined,
        });
        expect(socketService.canJoinRoom(rooms, '1')).toBe(false);
    });

    it('should join room', () => {
        const rooms = new Map<string, Room>();
        rooms.set('1', {
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: undefined,
        });
        const mockSocket = { id: 'socketId', data: {} } as unknown as Socket;
        expect(socketService.attemptJoinRoom(mockSocket, '1', rooms)).toEqual({ joined: true });
    });

    it('should not join room', () => {
        const rooms = new Map<string, Room>();
        socketService.canJoinRoom = jest.fn().mockReturnValue(false);
        expect(socketService.attemptJoinRoom({ id: 'socketId', data: {} } as unknown as Socket, '1', rooms)).toEqual({
            joined: false,
            message: GameEnum.ErrorMessage,
        });
    });

    it('user info should be valid', async () => {
        const mockSocket = { data: { room: '1', username: 'test' } } as unknown as Socket;
        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([]);
        socketService.isLoginValid = jest.fn().mockReturnValue(true);
        expect(await socketService.isUserInfoValid(mockSocket, new Map<string, Room>())).toBe(true);
    });

    it('user info should not be valid', async () => {
        const mockSocket = { data: { room: '1', username: 'test' } } as unknown as Socket;
        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([{ data: { username: 'test', answered: false } }]);
        expect(await socketService.isUserInfoValid(mockSocket, new Map<string, Room>())).toBe(false);
    });

    it('should populate a user socket', () => {
        const result = socketService.populateUserSocket('socketId', 'test', '1');
        expect(result).toEqual({
            data: {
                id: 'socketId',
                username: 'test',
                room: '1',
                score: 0,
                bonus: 0,
                answered: false,
                firstToAnswer: false,
                hasLeft: false,
            },
        });
    });

    it('should return the correct UserSocket when the username matches', () => {
        // Mock setup
        const room: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: {
                users: [
                    {
                        data: {
                            username: 'user1',
                            answered: false,
                        },
                    },
                    {
                        data: {
                            username: 'user2',
                            answered: false,
                        },
                    },
                    {
                        data: {
                            username: 'user3',
                            answered: false,
                        },
                    },
                ],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
            isStarted: false,
        };

        // Call the function
        const result = socketService.findSocketUser(room, 'user2');

        // Assertions
        expect(result).toBeDefined();
        expect(result.data.username).toBe('user2');
    });

    it('should return undefined when the username does not match any user', () => {
        const room: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: {
                users: [
                    {
                        data: {
                            username: 'user1',
                            answered: false,
                        },
                    },
                    {
                        data: {
                            username: 'user2',
                            answered: false,
                        },
                    },
                    {
                        data: {
                            username: 'user3',
                            answered: false,
                        },
                    },
                ],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
            isStarted: false,
        };
        const result = socketService.findSocketUser(room, 'nonExistingUser');
        expect(result).toBeUndefined();
    });

    it('should add to banned list', () => {
        const room: Room = {
            roomMessages: [],
            isOpen: true,
            bannedUsers: [],
            gameStats: {
                users: [],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
            isStarted: false,
        };
        socketService.addToBannedList(room, 'user1');
        expect(room.bannedUsers).toEqual(['user1']);
    });

    it('should return the socket of a banned user if found', async () => {
        const mockSocket = { data: { room: 'testRoom' } };

        const socketsMap = new Map();
        socketsMap.get = jest.fn().mockImplementation((key) => {
            if (key === 'socketId1') {
                return mockSocket;
            }
            return undefined;
        });
        socketsMap.set('socketId1', mockSocket);
        const serverMock = {
            sockets: {
                sockets: socketsMap,
                name: '',
                adapter: {},
                server: {},
                _fns: [],
            },
        };
        const mockGetSocketsInRoom = jest
            .fn()
            .mockResolvedValue([{ data: { username: 'bannedUser', id: 'socketId1' } }, { data: { username: 'otherUser', id: 'socketId2' } }]);
        socketService.getSocketsInRoom = mockGetSocketsInRoom;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketService['server'] = serverMock as any;
        const result = await socketService.getBannedSocket(mockSocket as unknown as Socket, 'bannedUser');
        expect(result).toBe(mockSocket as unknown as Socket);
    });

    it('should return null if the user is not found', async () => {
        const mockGetSocketsInRoom = jest.fn().mockResolvedValue([{ data: { username: 'otherUser', id: 'socketId2' } }]);
        const mockSocket = { data: { room: 'testRoom' } };
        socketService.getSocketsInRoom = mockGetSocketsInRoom;
        const result = await socketService.getBannedSocket(mockSocket as unknown as Socket, 'bannedUser');
        expect(result).toBeNull();
    });

    it('should return null if the socket of the user is not found', async () => {
        const mockGetSocketsInRoom = jest.fn().mockResolvedValue([{ data: { username: 'bannedUser', id: 'socketId1' } }]);
        const mockSocket = { data: { room: 'testRoom' } };
        socketService.getSocketsInRoom = mockGetSocketsInRoom;
        const result = await socketService.getBannedSocket(mockSocket as unknown as Socket, 'bannedUser');
        expect(result).toBeNull();
    });

    it('should update hasLeft', () => {
        const roomObj: Room = {
            roomMessages: [],
            isOpen: true,
            isStarted: true,
            bannedUsers: [],
            gameStats: {
                users: [{ data: { username: 'user1', answered: false, hasLeft: false } }, { data: { username: 'user2', answered: false } }],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
        };
        const mockSocket = { id: 'socketId', data: { room: 'testRoom', username: 'user1' } } as unknown as Socket;
        socketService.userLeaveRoom(roomObj, mockSocket, 'user1');
        expect(roomObj.gameStats.users[0].data.hasLeft).toEqual(true);
    });

    it('should remove user', () => {
        const roomObj: Room = {
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: {
                users: [{ data: { username: 'user1', answered: false, hasLeft: false } }, { data: { username: 'user2', answered: false } }],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
        };
        const mockSocket = { id: 'socketId', data: { room: 'testRoom', username: 'user1' } } as unknown as Socket;
        socketService.userLeaveRoom(roomObj, mockSocket, 'user1');
        expect(roomObj.gameStats.users.length).toEqual(1);
    });

    it('should reset user', () => {
        const room: Room = {
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: {
                users: [
                    { data: { username: 'user1', answered: false, firstToAnswer: true } },
                    { data: { username: 'user2', answered: false, firstToAnswer: false } },
                ],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
        };
        socketService.resetUser(room);
        expect(room.gameStats.users[0].data.firstToAnswer).toEqual(false);
        expect(room.gameStats.users[1].data.firstToAnswer).toEqual(false);
        expect(room.gameStats.users[0].data.answered).toEqual(false);
        expect(room.gameStats.users[1].data.answered).toEqual(false);
    });

    it('should not reset user', () => {
        const room: Room = undefined;
        socketService.resetUser(room);
        expect(room).toEqual(undefined);
    });

    it('should lock room if unlocked', () => {
        const room: Room = {
            roomMessages: [],
            isOpen: true,
            isStarted: false,
            bannedUsers: [],
            gameStats: {
                users: [],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
        };
        socketService.updateLockRoom(room);
        expect(room.isOpen).toEqual(false);
    });

    it('should unlock room if locked', () => {
        const room: Room = {
            roomMessages: [],
            isOpen: false,
            isStarted: false,
            bannedUsers: [],
            gameStats: {
                users: [],
                id: '',
                duration: 0,
                questions: [],
                name: '',
            },
        };
        socketService.updateLockRoom(room);
        expect(room.isOpen).toEqual(true);
    });

    it('should destroy room if user is an organizer', async () => {
        const mockSocket = { id: 'socketId', data: { room: '1234', username: GameEnum.Organizer } } as unknown as Socket;
        const room: Room = {} as Room;

        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([mockSocket]);

        const result = await socketService.destroyRoom(mockSocket, '1234', room);
        expect(result).toBeTruthy();
    });

    it('should destroy room if room has started and no other users', async () => {
        const mockSocket = { id: 'socketId', data: { room: '1234', username: 'user1' } } as unknown as Socket;
        const room: Room = {
            isStarted: true,
        } as Room;

        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([mockSocket]);

        const result = await socketService.destroyRoom(mockSocket, '1234', room);
        expect(result).toBeTruthy();
    });

    it('should not destroy room if user is not an organizer and other users are present', async () => {
        const mockSocket = { id: 'socketId', data: { room: '1234', username: 'user1' } } as unknown as Socket;
        const room: Room = {
            isStarted: true,
        } as Room;

        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([mockSocket, {}]);

        const result = await socketService.destroyRoom(mockSocket, '1234', room);
        expect(result).toBeFalsy();
    });

    it('should not destroy room if the room has not started', async () => {
        const mockSocket = { id: 'socketId', data: { room: '1234', username: 'user1' } } as unknown as Socket;
        const room: Room = {
            isStarted: false,
        } as Room;

        socketService.getSocketsInRoom = jest.fn().mockResolvedValue([mockSocket, {}]);

        const result = await socketService.destroyRoom(mockSocket, '1234', room);
        expect(result).toBeFalsy();
    });

    it('should confirm logged in user and perform actions when can join room', () => {
        const mockSocket = {
            data: { room: 'roomId', username: 'user1' },
            join: jest.fn(),
            id: 'socketId',
        };
        const mockRoom = { gameStats: { users: [] } };
        const rooms = new Map();
        rooms.set('roomId', mockRoom);

        const mockUser = { data: { username: 'user1', room: 'roomId' } };
        socketService.populateUserSocket = jest.fn().mockReturnValue(mockUser);
        socketService.canJoinRoom = jest.fn().mockReturnValue(true);

        const result = socketService.confirmLoggedIn(mockSocket as unknown as Socket, rooms);

        expect(result).toBe(true);
        expect(mockSocket.join).toHaveBeenCalledWith('roomId');
        expect(rooms.get('roomId').gameStats.users).toContain(mockUser);
        expect(socketService['server'].to).toHaveBeenCalledWith('roomId');
        expect(socketService['server'].except).toHaveBeenCalledWith('socketId');
        expect(socketService['server'].emit).toHaveBeenCalledWith(GameClientEvents.JoinedRoom, mockUser.data);
    });

    it('should not confirm logged in', () => {
        const mockSocket = {
            data: { room: 'roomId', username: 'user1' },
            join: jest.fn(),
            id: 'socketId',
        };
        const mockRoom = { gameStats: { users: [] } };
        const rooms = new Map();
        rooms.set('roomId', mockRoom);

        const mockUser = { data: { username: 'user1', room: 'roomId' } };
        socketService.populateUserSocket = jest.fn().mockReturnValue(mockUser);
        socketService.canJoinRoom = jest.fn().mockReturnValue(false);

        const result = socketService.confirmLoggedIn(mockSocket as unknown as Socket, rooms);

        expect(result).toBe(false);
    });

    it('should return false with a message if username is not provided', async () => {
        const mockSocket = { data: {} };
        const rooms = new Map();

        const result = await socketService.attemptLogin(mockSocket as unknown as Socket, rooms);

        expect(result).toEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should return false with a message if user info is not valid', async () => {
        const mockSocket = { data: { username: 'user1' } };
        const rooms = new Map();
        socketService.isUserInfoValid = jest.fn().mockResolvedValue(false);

        const result = await socketService.attemptLogin(mockSocket as unknown as Socket, rooms);

        expect(result).toEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });

    it('should return true without a message if user can log in', async () => {
        const mockSocket = { data: { username: 'user1' } };
        const rooms = new Map();
        socketService.isUserInfoValid = jest.fn().mockResolvedValue(true);
        socketService.confirmLoggedIn = jest.fn().mockReturnValue(true);

        const result = await socketService.attemptLogin(mockSocket as unknown as Socket, rooms);

        expect(result).toEqual({ joined: true });
    });

    it('should return false with a message if user cannot log in', async () => {
        const mockSocket = { data: { username: 'user1' } };
        const rooms = new Map();
        socketService.isUserInfoValid = jest.fn().mockResolvedValue(true);
        socketService.confirmLoggedIn = jest.fn().mockReturnValue(false);

        const result = await socketService.attemptLogin(mockSocket as unknown as Socket, rooms);

        expect(result).toEqual({ joined: false, message: GameEnum.UserNotValidMessage });
    });
});
