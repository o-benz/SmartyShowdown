import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { SocketAnswer } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Observable, Subscription, of } from 'rxjs';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let dialogServiceSpy: jasmine.SpyObj<DialogErrorService>;

    class MockRouter {
        events: Observable<unknown> = of(new NavigationStart(0, 'some-url'));
        navigateSpy = jasmine.createSpy('navigate');
        async navigate(commands: unknown[]): Promise<boolean> {
            this.navigateSpy(commands);
            return Promise.resolve(true);
        }
    }
    let mockRouter: MockRouter;

    beforeEach(() => {
        mockRouter = new MockRouter();
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'login',
            'joinRoom',
            'onRoomClosed',
            'leaveRoom',
            'connect',
            'disconnect',
        ]);
        dialogServiceSpy = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog']);

        TestBed.configureTestingModule({
            declarations: [JoinGameComponent, HeaderComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: DialogErrorService, useValue: dialogServiceSpy },
            ],
            imports: [FormsModule],
        });
        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog on successful room join', () => {
        socketServiceSpy.joinRoom.and.returnValue(of({ joined: true }));
        component.confirmCode();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should handle failed room join', () => {
        socketServiceSpy.joinRoom.and.returnValue(of({ joined: false }));
        component.confirmCode();
        expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should open error dialog on unsuccessful room join with error message', fakeAsync(() => {
        const socketResponse: SocketAnswer = { joined: false, message: 'Error' };
        socketServiceSpy.joinRoom.and.returnValue(of(socketResponse));

        component.confirmCode();
        tick();

        expect(dialogSpy.open).not.toHaveBeenCalled();
        expect(dialogServiceSpy.openErrorDialog).toHaveBeenCalledWith(socketResponse.message || '');
    }));

    it('should unsubscribe after room join observable completes', fakeAsync(() => {
        socketServiceSpy.joinRoom.and.returnValue(of({ joined: true }));
        component['socketSubscription'] = new Subscription();
        component.confirmCode();
        tick();

        expect(component['socketSubscription'].closed).toBeTrue();
    }));
});
