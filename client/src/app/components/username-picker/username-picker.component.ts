import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketAnswer } from '@app/interfaces/socket-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-username-picker',
    templateUrl: './username-picker.component.html',
    styleUrls: ['./username-picker.component.scss'],
})
export class UsernamePickerComponent {
    protected roomCode: string;
    protected username: string;
    private socketSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<UsernamePickerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { roomCode: string },
        private socketService: SocketCommunicationService,
        private router: Router,
        private dialogService: DialogAlertService,
    ) {}

    login(): void {
        this.socketSubscription = this.socketService.login(this.username).subscribe({
            next: (res: SocketAnswer) => {
                if (res.joined) {
                    this.closeDialog();
                    this.router.navigate(['/game/lobby']);
                } else if (res.message) this.dialogService.openErrorDialog(res.message);
            },
            complete: () => {
                if (this.socketSubscription) this.socketSubscription.unsubscribe();
            },
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
