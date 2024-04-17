import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminConnection } from '@app/interfaces/admin-connection';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnDestroy {
    adminConnection: AdminConnection;
    private loginSubscription: Subscription | null = null;

    constructor(
        public dialogRef: MatDialogRef<LoginFormComponent>,
        private authService: AuthenticationService,
        private errorDialogService: DialogAlertService,
    ) {
        this.adminConnection = { password: '' };
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
