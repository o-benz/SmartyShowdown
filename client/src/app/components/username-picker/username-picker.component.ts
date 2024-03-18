import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketAnswer } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-username-picker',
    templateUrl: './username-picker.component.html',
    styleUrls: ['./username-picker.component.scss'],
})
export class UsernamePickerComponent {
    private socketSubscription: Subscription;
    protected roomCode: string;
    protected username: string;

    constructor(
        public dialogRef: MatDialogRef<UsernamePickerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { roomCode: string },
        private socketService: SocketCommunicationService,
        private router: Router,
        private dialogService: DialogErrorService,
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
