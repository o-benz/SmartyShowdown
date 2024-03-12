import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { User } from '@app/interfaces/socket-model';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { WaitingRoomService } from '@app/services/waiting-room-handler/waitingroom.service';
import { Subscription, of } from 'rxjs';
import { WaitingRoomListComponent } from './waiting-room-list.component';

describe('WaitingRoomListComponent', () => {
    let component: WaitingRoomListComponent;
    let fixture: ComponentFixture<WaitingRoomListComponent>;

    let socketServiceMock: jasmine.SpyObj<SocketCommunicationService>;
    let waitingRoomServiceMock: jasmine.SpyObj<WaitingRoomService>;
    let mockRouter: jasmine.SpyObj<Router>;
    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketCommunicationService', [
            'getListUsers',
            'getUser',
            'onUserListUpdated',
            'onUserLeft',
            'banUser',
        ]);
        socketServiceMock.getListUsers.and.returnValue(of([]));
        socketServiceMock.getUser.and.returnValue(of({ username: 'currentUser' }));

        waitingRoomServiceMock = jasmine.createSpyObj('WaitingRoomService', ['isBannable']);
        waitingRoomServiceMock.isBannable.and.returnValue(false);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [WaitingRoomListComponent],
            providers: [
                { provide: SocketCommunicationService, useValue: socketServiceMock },
                { provide: WaitingRoomService, useValue: waitingRoomServiceMock },
                { provide: Router, useValue: mockRouter },
            ],
        });
        fixture = TestBed.createComponent(WaitingRoomListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update userList when a new user joins', () => {
        const newUser: User = { username: 'newUser' };
        socketServiceMock.onUserListUpdated.calls.mostRecent().args[0](newUser);

        expect(component['userList']).toContain(newUser);
    });

    it('should navigate to root when a user left is bannable', () => {
        const bannedUsername = 'bannedUser';
        waitingRoomServiceMock.isBannable.and.returnValue(true);

        socketServiceMock.onUserLeft.calls.mostRecent().args[0](bannedUsername);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should unsubscribe on ngOnDestroy', () => {
        component['socketSubscription'] = new Subscription();
        component.ngOnDestroy();
        expect(component['socketSubscription'].closed).toBeTrue();
    });

    it('should get the user list and update on ngOnInit', () => {
        const userListMock: User[] = [{ username: 'User1' }, { username: 'User2' }];
        socketServiceMock.getListUsers.and.returnValue(of(userListMock));

        component.ngOnInit();

        expect(component['userList']).toEqual(userListMock);
        expect(socketServiceMock.getListUsers).toHaveBeenCalled();
    });

    it('should get the current user on ngOnInit', () => {
        const currentUserMock: User = { username: 'CurrentUser' };
        socketServiceMock.getUser.and.returnValue(of(currentUserMock));

        component.ngOnInit();

        expect(component['user']).toEqual(currentUserMock);
        expect(socketServiceMock.getUser).toHaveBeenCalled();
    });

    it('should add a user when onUserListUpdated is called', () => {
        const newUser: User = { username: 'NewUser' };
        component.ngOnInit();
        socketServiceMock.onUserListUpdated.calls.mostRecent().args[0](newUser);

        expect(component['userList']).toContain(newUser);
    });

    it('should remove a user and navigate when onUserLeft is called and the user is bannable', () => {
        const bannedUser: User = { username: 'BannedUser' };
        component['userList'] = [bannedUser, { username: 'OtherUser' }];
        component['user'] = { username: 'CurrentUser' };
        waitingRoomServiceMock.isBannable.and.returnValue(true);

        component.ngOnInit();
        socketServiceMock.onUserLeft.calls.mostRecent().args[0](bannedUser.username);

        expect(component['userList'].find((u) => u.username === bannedUser.username)).toBeUndefined();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(waitingRoomServiceMock.isBannable).toHaveBeenCalledWith(bannedUser.username, component['user']);
    });

    it('should not navigate when onUserLeft is called and the user is not bannable', () => {
        const nonBannedUser: User = { username: 'NonBannedUser' };
        component['userList'] = [nonBannedUser, { username: 'OtherUser' }];
        component['user'] = { username: 'CurrentUser' };

        waitingRoomServiceMock.isBannable.and.returnValue(false);

        component.ngOnInit();
        socketServiceMock.onUserLeft.calls.mostRecent().args[0](nonBannedUser.username);

        expect(component['userList'].find((u) => u.username === nonBannedUser.username)).toBeUndefined();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should call socketService.banUser when banUser is called', () => {
        const testUsername = 'testUser';
        component.banUser(testUsername);
        expect(socketServiceMock.banUser).toHaveBeenCalledWith(testUsername);
    });
});
