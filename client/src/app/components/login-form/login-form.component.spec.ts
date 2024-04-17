import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthServiceMock, MatDialogRefMock } from '@app/interfaces/admin-connection';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
    let component: LoginFormComponent;
    let fixture: ComponentFixture<LoginFormComponent>;
    let authServiceMock: AuthServiceMock;
    let dialogRefMock: MatDialogRefMock;
    let dialogAlertService: DialogAlertService;

    beforeEach(waitForAsync(() => {
        authServiceMock = jasmine.createSpyObj('AuthenticationService', ['attemptLogin']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogAlertService = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [LoginFormComponent],
            providers: [
                { provide: AuthenticationService, useValue: authServiceMock },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: DialogAlertService, useValue: dialogAlertService },
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
        expect(component['loginSubscription']).toBeTruthy();
    });

    it('should attempt login and handle failure', () => {
        const response = false;
        authServiceMock.attemptLogin.and.returnValue(of(response));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(dialogAlertService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.RefusedAccess);
        expect(component['loginSubscription']).toBeTruthy();
    });

    it('should handle login error', () => {
        authServiceMock.attemptLogin.and.returnValue(throwError(() => new Error('Some error')));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(dialogAlertService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.ConnectionError);
        expect(component['loginSubscription']).toBeTruthy();
    });

    it('should unsubscribe on component destroy', () => {
        component.ngOnDestroy();
        expect(component['loginSubscription']).toBeFalsy();
    });
});
