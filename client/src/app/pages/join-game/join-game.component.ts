import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { Naviguation, SocketAnswer } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    protected roomCode: string;
    protected username: string;
    private socketSubscription: Subscription;

    /* eslint-disable max-params */
    constructor(
        private socketService: SocketCommunicationService,
        private router: Router,
        private dialog: MatDialog,
        private dialogService: DialogErrorService,
    ) {}

    ngOnInit(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart && event.navigationTrigger === Naviguation.Back) this.socketService.disconnect();
        });
    }

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
        this.dialog.closeAll();
    }

    openDialog(): void {
        this.dialog.open(this.dialogTemplate, {
            width: '500px',
            data: { roomCode: this.roomCode },
        });
    }

    confirmCode(): void {
        this.socketService.connect();
        this.socketSubscription = this.socketService.joinRoom(this.roomCode).subscribe({
            next: (res: SocketAnswer) => {
                if (res.joined) this.openDialog();
                else if (res.message) this.dialogService.openErrorDialog(res.message);
            },
            complete: () => {
                if (this.socketSubscription) this.socketSubscription.unsubscribe();
            },
        });
    }
}
