import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { GameStats } from '@app/interfaces/game-stats';
import { User } from '@app/interfaces/socket-model';
import { CountdownService } from '@app/services/countdown/countdown.service';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subject, Subscription, of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let socketCommunicationServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let countdownServiceSpy: jasmine.SpyObj<CountdownService>;
    let dialogErrorServiceSpy: jasmine.SpyObj<DialogErrorService>;
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
        ]);
        const countdownSpy = jasmine.createSpyObj('CountdownService', ['startCountdown', 'stopCountdown']);
        const dialogErrorSpy = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog', 'closeErrorDialog']);

        countdownSpy.countdownTick = new Subject<number>();
        countdownSpy.countdownEnded = new Subject<void>();

        await TestBed.configureTestingModule({
            declarations: [LobbyPageComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: SocketCommunicationService, useValue: socketSpy },
                { provide: CountdownService, useValue: countdownSpy },
                { provide: DialogErrorService, useValue: dialogErrorSpy },
                { provide: ChangeDetectorRef, useValue: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']) },
            ],
        }).compileComponents();

        socketCommunicationServiceSpy = TestBed.inject(SocketCommunicationService) as jasmine.SpyObj<SocketCommunicationService>;
        countdownServiceSpy = TestBed.inject(CountdownService) as jasmine.SpyObj<CountdownService>;
        dialogErrorServiceSpy = TestBed.inject(DialogErrorService) as jasmine.SpyObj<DialogErrorService>;
        router = TestBed.inject(Router);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;

        component.countdownSub = new Subscription();
        component.lobbySub = new Subscription();

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
        expect(component.organizer).toBeUndefined();
    });

    it('should initialize component properties', () => {
        expect(component.countdownValue).toEqual(5);
        expect(component.roomCode).toBeUndefined();
        expect(component.quizName).toBeUndefined();
        expect(component.roomLocked).toBeFalsy();
        expect(component.gameStarted).toBeFalsy();
        expect(component.organizer).toBeFalsy();
    });

    it('should set and return countdown subscription', () => {
        const subscription = new Subscription();
        component.countdownSub = subscription;
        expect(component.countdownSub).toBe(subscription);
    });

    it('should set and return lobby subscription', () => {
        const subscription = new Subscription();
        component.lobbySub = subscription;
        expect(component.lobbySub).toBe(subscription);
    });

    it('should set organizer correctly', () => {
        component.organizer = true;
        expect(component['isOrganizer']).toBeTrue();

        component.organizer = false;
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
        component.organizer = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(true));

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogErrorServiceSpy.openErrorDialog).not.toHaveBeenCalled();
    });

    it('should handle room not locked error', () => {
        component.roomCode = '123';
        component.organizer = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(false));

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogErrorServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.NotLockRoom);
        expect(dialogErrorServiceSpy.openErrorDialog).not.toHaveBeenCalledWith(ErrorMessages.NoPlayer);
    });

    it('should handle no player error', () => {
        component.roomCode = '123';
        component.organizer = true;
        socketCommunicationServiceSpy.attemptStartGame.and.returnValue(of(false));
        component.roomLocked = true;

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).toHaveBeenCalledWith('123');
        expect(dialogErrorServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.NoPlayer);
        expect(dialogErrorServiceSpy.openErrorDialog).not.toHaveBeenCalledWith(ErrorMessages.NotLockRoom);
    });

    it('should not start game if room code is missing', () => {
        component.roomCode = '';
        component.organizer = true;

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).not.toHaveBeenCalled();
        expect(dialogErrorServiceSpy.openErrorDialog).not.toHaveBeenCalled();
    });

    it('should not start game if not organizer', () => {
        component.roomCode = '123';
        component.organizer = false;

        component.startGame();

        expect(socketCommunicationServiceSpy.attemptStartGame).not.toHaveBeenCalled();
        expect(dialogErrorServiceSpy.openErrorDialog).not.toHaveBeenCalled();
    });

    it('should start game countdown', () => {
        component.startGameCountdown();

        expect(component.gameStarted).toBeTrue();
        expect(countdownServiceSpy.startCountdown).toHaveBeenCalledWith(component.countdownValue);
        expect(component.countdownSub).toBeDefined();
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

        component.countdownSub = countdownSubSpy;
        component.lobbySub = lobbySubSpy;

        component.ngOnDestroy();

        expect(countdownSubSpy.unsubscribe).toHaveBeenCalled();
        expect(lobbySubSpy.unsubscribe).toHaveBeenCalled();
    });

    it('should handle room closure and navigate to home page when room is closed', () => {
        component.roomCode = '123';
        component.organizer = true;
        const onRoomClosedCallback = () => {
            dialogErrorServiceSpy.closeErrorDialog();
            dialogErrorServiceSpy.openErrorDialog(component.organizer ? ErrorMessages.QuitRoom : ErrorMessages.ClosedRoom);
            socketCommunicationServiceSpy.leaveRoom();
            router.navigate(['/']);
        };

        const navigateSpy = spyOn(router, 'navigate');
        socketCommunicationServiceSpy.onRoomClosed.and.callFake(onRoomClosedCallback);
        onRoomClosedCallback();

        expect(dialogErrorServiceSpy.closeErrorDialog).toHaveBeenCalled();
        expect(dialogErrorServiceSpy.openErrorDialog).toHaveBeenCalledWith(component.organizer ? ErrorMessages.QuitRoom : ErrorMessages.ClosedRoom);
        expect(socketCommunicationServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle room closure and navigate to home page when organizer leaves room', () => {
        component.roomCode = '123';
        component.organizer = true;

        const onRoomClosedCallback = () => {
            dialogErrorServiceSpy.closeErrorDialog();
            dialogErrorServiceSpy.openErrorDialog(component.organizer ? ErrorMessages.QuitRoom : ErrorMessages.ClosedRoom);
            socketCommunicationServiceSpy.leaveRoom();
            router.navigate(['/']);
        };

        const navigateSpy = spyOn(router, 'navigate');
        socketCommunicationServiceSpy.onRoomClosed.and.callFake(onRoomClosedCallback);

        onRoomClosedCallback();

        expect(dialogErrorServiceSpy.closeErrorDialog).toHaveBeenCalled();
        expect(dialogErrorServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.ClosedRoom);
        expect(socketCommunicationServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle room closure and navigate to home page when non-organizer leaves room', () => {
        component.roomCode = '123';
        component.organizer = false;

        const onRoomClosedCallback = () => {
            dialogErrorServiceSpy.closeErrorDialog();
            dialogErrorServiceSpy.openErrorDialog(component.organizer ? ErrorMessages.QuitRoom : ErrorMessages.ClosedRoom);
            socketCommunicationServiceSpy.leaveRoom();
            router.navigate(['/']);
        };
        const navigateSpy = spyOn(router, 'navigate');
        socketCommunicationServiceSpy.onRoomClosed.and.callFake(onRoomClosedCallback);
        onRoomClosedCallback();

        expect(dialogErrorServiceSpy.closeErrorDialog).toHaveBeenCalled();
        expect(dialogErrorServiceSpy.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.ClosedRoom);
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
        component.organizer = true;

        const result = component.itIsOrganizer();
        expect(result).toBeTrue();
    });

    it('should return false if the user is not the organizer', () => {
        component.organizer = false;
        const result = component.itIsOrganizer();
        expect(result).toBeFalse();
    });
});
