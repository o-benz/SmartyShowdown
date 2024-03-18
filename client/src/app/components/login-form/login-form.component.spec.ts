import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthServiceMock, MatDialogRefMock } from '@app/interfaces/admin-connection';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
    let component: LoginFormComponent;
    let fixture: ComponentFixture<LoginFormComponent>;
    let authServiceMock: AuthServiceMock;
    let dialogRefMock: MatDialogRefMock;
    let dialogErrorService: DialogErrorService;

    beforeEach(waitForAsync(() => {
        authServiceMock = jasmine.createSpyObj('AuthenticationService', ['attemptLogin']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogErrorService = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [LoginFormComponent],
            providers: [
                { provide: AuthenticationService, useValue: authServiceMock },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: DialogErrorService, useValue: dialogErrorService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should attempt login and handle success', () => {
        const response = true;
        authServiceMock.attemptLogin.and.returnValue(of(response));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
        expect(component.isLoginSubscriptionClosed).toBeTruthy();
    });

    it('should attempt login and handle failure', () => {
        const response = false;
        authServiceMock.attemptLogin.and.returnValue(of(response));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(dialogErrorService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.RefusedAccess);
        expect(component.isLoginSubscriptionClosed).toBeTruthy();
    });

    it('should handle login error', () => {
        authServiceMock.attemptLogin.and.returnValue(throwError(() => new Error('Some error')));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(dialogErrorService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.ConnectionError);
        expect(component.isLoginSubscriptionClosed).toBeTruthy();
    });

    it('should unsubscribe on component destroy', () => {
        component.ngOnDestroy();
        expect(component.isLoginSubscriptionClosed).toBeTruthy();
    });
});
