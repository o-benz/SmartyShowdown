import { Room, UserSocket } from '@app/model/socket/socket.schema';
import { FAKE_GAME_STAT } from '@app/model/stats/stats.schema';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let socketService: SocketService;
    let mockServer: jest.Mocked<Server>;

    beforeEach(() => {
        socketService = new SocketService();
        mockServer = {
            in: jest.fn().mockReturnThis(),
            fetchSockets: jest.fn(),
        } as unknown as jest.Mocked<Server>;
    });

    describe('isUserValid', () => {
        it('should return true for a valid non-organizer user', () => {
            const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
            expect(socketService.isUserValid('newuser', users)).toBe(true);
        });

        it('should return false for the organizer username', () => {
            const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
            expect(socketService.isUserValid('organisateur', users)).toBe(false);
        });
    });

    describe('isUniqueUsername', () => {
        it('should return true for a unique username', () => {
            const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
            expect(socketService.isUniqueUsername('user3', users)).toBe(true);
        });

        it('should return false for a non-unique username', () => {
            const users: UserSocket[] = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
            expect(socketService.isUniqueUsername('user1', users)).toBe(false);
        });
    });

    describe('isNotOrganizer', () => {
        it('should return true for a non-organizer username', () => {
            expect(socketService.isNotOrganizer('user')).toBe(true);
        });

        it('should return false for the organizer username', () => {
            expect(socketService.isNotOrganizer('organisateur')).toBe(false);
        });
    });

    describe('getSocketsInRoom', () => {
        it('should fetch sockets in a room', async () => {
            const room = 'testRoom';
            const mockSockets: Partial<Socket>[] = [{ id: '1' }, { id: '2' }];
            mockServer.in(room).fetchSockets = jest.fn().mockResolvedValue(mockSockets);

            const result = await socketService.getSocketsInRoom(room, mockServer);
            expect(mockServer.in).toHaveBeenCalledWith(room);
            expect(mockServer.in(room).fetchSockets).toHaveBeenCalled();
            expect(result).toEqual(mockSockets);
        });
    });

    describe('getAllUsernamesInRoom', () => {
        it('should return all usernames in a room', async () => {
            const room = 'testRoom';
            const mockSockets = [{ data: { username: 'user1', answered: false } }, { data: { username: 'user2', answered: false } }];
            mockServer.in(room).fetchSockets = jest.fn().mockResolvedValue(mockSockets);

            const result = await socketService.getAllUsernamesInRoom(room, mockServer);
            expect(mockServer.in).toHaveBeenCalledWith(room);
            expect(mockServer.in(room).fetchSockets).toHaveBeenCalled();
            expect(result).toEqual(['user1', 'user2']);
        });
    });

    describe('isLoginValid', () => {
        it('should return true for a valid login', () => {
            const room = 'testRoom';
            const username = 'user1';
            const rooms = new Map<string, Room>();
            rooms.set(room, {
                roomMessages: [],
                isOpen: true,
                isStarted: true,
                bannedUsers: [],
                gameStats: FAKE_GAME_STAT,
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
                gameStats: FAKE_GAME_STAT,
            });

            const mockSocket = { data: { room } } as unknown as Socket;
            expect(socketService.isLoginValid(rooms, mockSocket, username)).toBe(false);
        });
    });
});
