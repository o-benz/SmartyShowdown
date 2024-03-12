import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminConnection } from '@app/interfaces/admin-connection';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnDestroy {
    adminConnection: AdminConnection;

    protected loginErrorMessage: string;
    private loginSubscription: Subscription | null = null;

    constructor(
        public dialogRef: MatDialogRef<LoginFormComponent>,
        private authService: AuthenticationService,
    ) {
        this.adminConnection = { password: '' };
    }

    get errorMessage(): string | null {
        return this.loginErrorMessage.length > 0 ? this.loginErrorMessage : null;
    }

    get isLoginSubscriptionClosed(): boolean {
        return this.loginSubscription ? this.loginSubscription.closed : true;
    }

    onLogin() {
        this.loginSubscription = this.authService.attemptLogin(this.adminConnection.password).subscribe({
            next: (response) => {
                if (response) {
                    this.dialogRef.close(true);
                } else {
                    this.loginErrorMessage = 'Accès refusé.';
                }
            },
            error: () => {
                this.loginErrorMessage = 'Erreur de connexion. Veuillez réessayer.';
            },
        });
    }

    ngOnDestroy() {
        this.loginSubscription?.unsubscribe();
    }
}
