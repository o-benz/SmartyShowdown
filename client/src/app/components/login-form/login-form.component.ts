import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminConnection } from '@app/interfaces/admin-connection';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnDestroy {
    adminConnection: AdminConnection;
    component: { closed: false };
    private loginSubscription: Subscription | null = null;

    constructor(
        public dialogRef: MatDialogRef<LoginFormComponent>,
        private authService: AuthenticationService,
        private errorDialogService: DialogErrorService,
    ) {
        this.adminConnection = { password: '' };
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
                    this.errorDialogService.openErrorDialog(ErrorMessages.RefusedAccess);
                }
            },
            error: () => {
                this.errorDialogService.openErrorDialog(ErrorMessages.ConnectionError);
            },
        });
    }

    ngOnDestroy() {
        this.loginSubscription?.unsubscribe();
    }
}
