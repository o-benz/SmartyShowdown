import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { UsernamePickerComponent } from '@app/components/username-picker/username-picker.component';
import { Naviguation, SocketAnswer } from '@app/interfaces/socket-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit, OnDestroy {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    protected roomCode: string;
    protected username: string;
    private socketSubscription: Subscription;

    /* eslint-disable max-params */
    constructor(
        private socketService: SocketCommunicationService,
        private router: Router,
        private dialog: MatDialog,
        private dialogService: DialogAlertService,
    ) {}

    ngOnInit(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart && event.navigationTrigger === Naviguation.Back) this.socketService.disconnect();
        });
    }

    confirmCode(): void {
        this.socketService.connect();
        this.socketSubscription = this.socketService.joinRoom(this.roomCode).subscribe({
            next: (res: SocketAnswer) => {
                if (res.joined) {
                    this.dialog.open(UsernamePickerComponent, { data: { roomCode: this.roomCode } });
                } else if (res.message) this.dialogService.openErrorDialog(res.message);
            },
            complete: () => {
                if (this.socketSubscription) this.socketSubscription.unsubscribe();
            },
        });
    }

    ngOnDestroy(): void {
        if (this.socketSubscription) this.socketSubscription.unsubscribe();
    }
}
