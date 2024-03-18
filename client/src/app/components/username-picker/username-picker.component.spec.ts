import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { SocketAnswer } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Observable, Subscription, of } from 'rxjs';
import { UsernamePickerComponent } from './username-picker.component';

describe('UsernamePickerComponent', () => {
    let component: UsernamePickerComponent;
    let fixture: ComponentFixture<UsernamePickerComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let dialogServiceSpy: jasmine.SpyObj<DialogErrorService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    class MockRouter {
        events: Observable<unknown> = of(new NavigationStart(0, 'some-url'));
        navigateSpy = jasmine.createSpy('navigate');
        async navigate(commands: unknown[]): Promise<boolean> {
            this.navigateSpy(commands);
            return Promise.resolve(true);
        }
    }
    let mockRouter: MockRouter;

    beforeEach(async () => {
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
            declarations: [UsernamePickerComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: DialogErrorService, useValue: dialogServiceSpy },
            ],
            imports: [FormsModule],
        });

        fixture = TestBed.createComponent(UsernamePickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to game lobby on successful login', fakeAsync(() => {
        socketServiceSpy.login.and.returnValue(of({ joined: true }));
        component.login();
        tick();
        expect(mockRouter.navigateSpy).toHaveBeenCalledWith(['/game/lobby']);
    }));

    it('should handle failed login', () => {
        socketServiceSpy.login.and.returnValue(of({ joined: false }));
        component.login();
        expect(mockRouter.navigateSpy).not.toHaveBeenCalled();
    });

    it('should open error dialog on login failure with error message', fakeAsync(() => {
        const socketResponse: SocketAnswer = { joined: false, message: 'Error' };
        socketServiceSpy.login.and.returnValue(of(socketResponse));
        dialogSpy.closeAll.calls.reset();

        component.login();
        tick();

        expect(dialogSpy.closeAll).not.toHaveBeenCalled();
        expect(dialogServiceSpy.openErrorDialog).toHaveBeenCalledWith(socketResponse.message || '');
    }));

    it('should unsubscribe after login observable completes', fakeAsync(() => {
        const socketResponse: SocketAnswer = { joined: true };
        socketServiceSpy.login.and.returnValue(of(socketResponse));
        component['socketSubscription'] = new Subscription();

        component.login();
        tick();

        expect(component['socketSubscription'].closed).toBeTrue();
    }));
});
