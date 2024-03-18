import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from './socket-communication.constants';
import { SocketCommunicationService } from './socket-communication.service';

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
        const callback = () => {
            /* Do nothing */
        };
        service.on('testEvent', callback);
        expect(spy).toHaveBeenCalledWith('testEvent', callback);
    });

    it('should handle socket send method', () => {
        const spy = spyOn(service.socket, 'emit');
        const callback = () => {
            /* Do nothing */
        };
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

        expect(onSpy).toHaveBeenCalledWith(SOCKET_EVENTS.roomClosed, action);
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
            // Arrange
            const action = jasmine.createSpy('action');
            const onSpy = spyOn(service.socket, 'on').and.callFake((event, callback) => {
                if (event === 'gameStarted') {
                    callback(); // Simulate the event being emitted
                }
                return service.socket;
            });

            // Act
            service.onGameStarted(action);

            // Assert
            expect(onSpy).toHaveBeenCalledWith('gameStarted', jasmine.any(Function));
            expect(action).toHaveBeenCalled();
        });
    });
});
