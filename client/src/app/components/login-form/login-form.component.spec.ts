import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthServiceMock, MatDialogRefMock } from '@app/interfaces/admin-connection';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
    let component: LoginFormComponent;
    let fixture: ComponentFixture<LoginFormComponent>;
    let authServiceMock: AuthServiceMock;
    let dialogRefMock: MatDialogRefMock;

    beforeEach(waitForAsync(() => {
        authServiceMock = jasmine.createSpyObj('AuthenticationService', ['attemptLogin']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [LoginFormComponent],
            providers: [
                { provide: AuthenticationService, useValue: authServiceMock },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
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
        expect(component.isLoggedIn).toBeTrue();
        expect(component.loginError).toBeFalse();
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should attempt login and handle failure', () => {
        const response = false;
        authServiceMock.attemptLogin.and.returnValue(of(response));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(component.isLoggedIn).toBeFalse();
        expect(component.loginError).toBeTrue();
        expect(component.loginErrorMessage).toEqual('Accès refusé.');
    });

    it('should handle login error', () => {
        authServiceMock.attemptLogin.and.returnValue(throwError(() => new Error('Some error')));

        component.onLogin();
        expect(authServiceMock.attemptLogin).toHaveBeenCalledWith(component.adminConnection.password);
        expect(component.isLoggedIn).toBeFalse();
        expect(component.loginError).toBeTrue();
        expect(component.loginErrorMessage).toEqual('Erreur de connexion. Veuillez réessayer.');
    });

    it('should log out Successfully', () => {
        component.onLogout();
        expect(component.isLoggedIn).toBeFalse();
    });
});
