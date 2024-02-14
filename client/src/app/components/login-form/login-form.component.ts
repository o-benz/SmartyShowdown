import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminConnection } from '@app/interfaces/admin-connection';
import { AuthenticationService } from '@app/services/authentication/authentication.service';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
    adminConnection: AdminConnection;

    isLoggedIn: boolean = false;
    loginError: boolean = false;
    loginErrorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<LoginFormComponent>,
        private authService: AuthenticationService,
    ) {
        this.adminConnection = { password: '' };
    }

    onLogin() {
        this.authService.attemptLogin(this.adminConnection.password).subscribe({
            next: (response) => {
                if (response) {
                    this.isLoggedIn = true;
                    this.loginError = false;
                    this.dialogRef.close(true);
                } else {
                    this.isLoggedIn = false;
                    this.loginError = true;
                    this.loginErrorMessage = 'Accès refusé.';
                }
            },
            error: () => {
                this.isLoggedIn = false;
                this.loginError = true;
                this.loginErrorMessage = 'Erreur de connexion. Veuillez réessayer.';
            },
        });
    }

    onLogout() {
        this.isLoggedIn = false;
    }
}
