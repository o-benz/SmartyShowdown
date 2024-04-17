/* eslint-disable max-classes-per-file */
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '@app/components/header/header.component';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { GameStats } from '@app/interfaces/game-stats';
import { User } from '@app/interfaces/socket-model';
import { CountdownService } from '@app/services/countdown/countdown.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subject, Subscription, of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

@Component({ standalone: true, selector: 'app-chat-box', template: '' })
class ChatStubComponent {}
@Component({ standalone: true, selector: 'app-waiting-room-list', template: '' })
class WaitingRoomStubComponent {
    @Input() isOrganizer: boolean;
}

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let socketCommunicationServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let countdownServiceSpy: jasmine.SpyObj<CountdownService>;
    let dialogAlertServiceSpy: jasmine.SpyObj<DialogAlertService>;
    let router: Router;

    beforeEach(async () => {
        const socketSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'getUser',
            'onGameStarted',
            'onRoomClosed',
            'getStats',
            'unlockRoom',
            'lockRoom',
            'attemptStartGame',
            'leaveRoom',
            'getListUsers',
        ]);
        const countdownSpy = jasmine.createSpyObj('CountdownService', ['startCountdown', 'stopCountdown']);
        const dialogErrorSpy = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog', 'closeAlertDialog']);

        countdownSpy.countdownTick = new Subject<number>();
        countdownSpy.countdownEnded = new Subject<void>();

        await TestBed.configureTestingModule({
            declarations: [LobbyPageComponent, HeaderComponent],
            imports: [RouterTestingModule, ChatStubComponent, WaitingRoomStubComponent],
            providers: [
                { provide: SocketCommunicationService, useValue: socketSpy },
                { provide: CountdownService, useValue: countdownSpy },
                { provide: DialogAlertService, useValue: dialogErrorSpy },
                { provide: ChangeDetectorRef, useValue: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']) },
                { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        socketCommunicationServiceSpy = TestBed.inject(SocketCommunicationService) as jasmine.SpyObj<SocketCommunicationService>;
        countdownServiceSpy = TestBed.inject(CountdownService) as jasmine.SpyObj<CountdownService>;
        dialogAlertServiceSpy = TestBed.inject(DialogAlertService) as jasmine.SpyObj<DialogAlertService>;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start game countdown when game starts', () => {
        const startGameCountdownSpy = spyOn(component, 'startGameCountdown').and.callThrough();
        socketCommunicationServiceSpy.onGameStarted.and.callFake((callback: () => void) => {
            callback();
        });

        component.ngOnInit();
        expect(startGameCountdownSpy).toHaveBeenCalled();
    });

    it('should set room code and organizer flag when user data is received', () => {
        const user: User = { room: '123', username: 'organisateur', answered: false };
        socketCommunicationServiceSpy.getUser.and.returnValue(of(user));
        component.ngOnInit();
        expect(component.roomCode).toEqual('123');
        expect(component['isOrganizer']).toBeTrue();
    });

    it('should set room code and organizer flag when user data is wrong', () => {
        const user: User = {} as unknown as User;
        socketCommunicationServiceSpy.getUser.and.returnValue(of(user));
        component.ngOnInit();
        expect(component.roomCode).toEqual('');
        expect(component['isOrganizer']).toBeFalse();
    });

    it('should initialize component properties', () => {
        expect(component.countdownValue).toEqual(5); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(component.roomCode).toBeUndefined();
        expect(component.quizName).toBeUndefined();
        expect(component.roomLocked).toBeFalsy();
        expect(component.gameStarted).toBeFalsy();
        expect(component['isOrganizer']).toBeFalsy();
    });

    it('should set and return countdown subscription', () => {
        const subscription = new Subscription();
        component['countdownSubscription'] = subscription;
        expect(component['countdownSubscription']).toBe(subscription);
    });

    it('should set and return lobby subscription', () => {
        const subscription = new Subscription();
        component['lobbySubscription'] = subscription;
        expect(component['lobbySubscription']).toBe(subscription);
    });

    it('should set organizer correctly', () => {
        component['isOrganizer'] = true;
        expect(component['isOrganizer']).toBeTrue();

        component['isOrganizer'] = false;
        expect(component['isOrganizer']).toBeFalse();
    });

    it('should call getQuizName on initialization', () => {
        const getStatsSpy = socketCommunicationServiceSpy.getStats.and.returnValue(
            of<GameStats>({ id: '1', duration: 10, questions: [], users: [], name: 'Test Quiz' }),
        );
        component.ngOnInit();
        expect(getStatsSpy).toHaveBeenCalled();
        expect(component.quizName).toEqual('Test Quiz');
    });

    it('should toggle room lock', () => {
        component.roomCode = '123';
        component.roomLocked = false;
        component.toggleRoomLock();

        expect(socketCommunicationServiceSpy.lockRoom).toHaveBeenCalledWith('123');
        expect(component.roomLocked).toBeTrue();

        component.toggleRoomLock();
        expect(socketCommunicationServiceSpy.unlockRoom).toHaveBeenCalledWith('123');
        expect(component.roomLocked).toBeFalse();
    });

    it('should start game', () => {
        component.roomCode = '123';
        component['isOrganizer'] = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(true));

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogAlertServiceSpy.openErrorDialog).not.toHaveBeenCalled();
    });

    it('should handle room not locked error', () => {
        component.roomCode = '123';
        component['isOrganizer'] = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(false));

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogAlertServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.NotLockRoom);
        expect(dialogAlertServiceSpy.openErrorDialog).not.toHaveBeenCalledWith(ErrorMessages.NoPlayer);
    });

    it('should handle no player error', () => {
        component.roomCode = '123';
        component['isOrganizer'] = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(false));
        component.roomLocked = true;

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogAlertServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.NoPlayer);
        expect(dialogAlertServiceSpy.openErrorDialog).not.toHaveBeenCalledWith(ErrorMessages.NotLockRoom);
    });

    it('should start game countdown', () => {
        component.startGameCountdown();

        expect(component.gameStarted).toBeTrue();
        expect(countdownServiceSpy.startCountdown).toHaveBeenCalledWith(component.countdownValue);
        expect(component['countdownSubscription']).toBeDefined();
    });

    it('should navigate to game play when countdown ends', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.startGameCountdown();
        countdownServiceSpy.countdownEnded.next();

        expect(navigateSpy).toHaveBeenCalledWith(['/game/play']);
    });

    it('should unsubscribe from subscriptions on destroy', () => {
        const countdownSubSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        const lobbySubSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);

        component['countdownSubscription'] = countdownSubSpy;
        component['lobbySubscription'] = lobbySubSpy;

        component.ngOnDestroy();

        expect(countdownSubSpy.unsubscribe).toHaveBeenCalled();
        expect(lobbySubSpy.unsubscribe).toHaveBeenCalled();
    });

    it('should handle room closure and navigate to home page', () => {
        component['isOrganizer'] = false;
        socketCommunicationServiceSpy.onRoomClosed.and.callFake((callback) => callback());

        const navigateSpy = spyOn(router, 'navigate');
        component.ngOnInit();

        expect(dialogAlertServiceSpy.closeAlertDialog).toHaveBeenCalled();
        expect(dialogAlertServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.ClosedRoom);
        expect(socketCommunicationServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle room closure and navigate to home page', () => {
        component['isOrganizer'] = true;
        socketCommunicationServiceSpy.onRoomClosed.and.callFake((callback) => callback());

        const navigateSpy = spyOn(router, 'navigate');
        component.ngOnInit();

        expect(dialogAlertServiceSpy.closeAlertDialog).toHaveBeenCalled();
        expect(dialogAlertServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.QuitRoom);
        expect(socketCommunicationServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should update countdown value and trigger change detection when countdown tick occurs', () => {
        const num = 4;
        component.countdownValue = 5;
        const detectChangesSpy = spyOn(component['changeDetectorRef'], 'detectChanges');

        component.startGameCountdown();

        countdownServiceSpy.countdownTick.next(num);

        expect(component.countdownValue).toEqual(num);
        expect(detectChangesSpy).toHaveBeenCalled();
    });

    it('should return true if the user is the organizer', () => {
        component['isOrganizer'] = true;

        const result = component.itIsOrganizer();
        expect(result).toBeTrue();
    });

    it('should return false if the user is not the organizer', () => {
        component['isOrganizer'] = false;
        const result = component.itIsOrganizer();
        expect(result).toBeFalse();
    });
});
