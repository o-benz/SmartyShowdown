import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit {
    roomCode: string | null = null;
    roomLocked: boolean = false;
    protected isOrganizer: boolean = false;
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private socketCommunicationService: SocketCommunicationService,
        private dialogError: DialogErrorService,
    ) {}

    ngOnInit(): void {
        this.socketCommunicationService.getUser().subscribe((user: User) => {
            this.roomCode = user.room || '';
            this.isOrganizer = user.username === 'organisateur';
        });

        this.socketCommunicationService.onGameStarted(() => {
            this.router.navigate(['/game/play']);
        });
        this.changeDetectorRef.detectChanges();
    }

    toggleRoomLock(): void {
        if (this.roomCode) {
            if (this.roomLocked) {
                this.socketCommunicationService.unlockRoom(this.roomCode);
            } else {
                this.socketCommunicationService.lockRoom(this.roomCode);
            }
            this.roomLocked = !this.roomLocked;
        }
    }

    itIsOrganizer(): boolean {
        return this.isOrganizer;
    }

    startGame(): void {
        if (this.roomCode) {
            this.socketCommunicationService.attemptStartGame(this.roomCode).subscribe((open) => {
                if (open) {
                    this.router.navigate(['/game/play']);
                } else if (!this.itIsOrganizer()) {
                    this.dialogError.openErrorDialog("Seulement l'organisateur peut demarrer une partie");
                } else {
                    this.dialogError.openErrorDialog('Aucun joueur avec qui jouer 😔');
                }
            });
        }
    }
}
