import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { User } from '@app/interfaces/socket-model';
import { CountdownService } from '@app/services/countdown/countdown.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

const TIME = 5;

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    countdownValue: number = TIME;
    roomCode: string;
    quizName: string;
    roomLocked: boolean = false;
    gameStarted: boolean = false;
    protected isOrganizer: boolean = false;
    private lobbySubscription: Subscription;
    private countdownSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private socketCommunicationService: SocketCommunicationService,
        private dialogError: DialogAlertService,
        private countdownService: CountdownService,
    ) {}

    ngOnInit(): void {
        this.getQuizName();

        this.lobbySubscription = this.socketCommunicationService.getUser()?.subscribe((user: User) => {
            this.roomCode = user?.room || '';
            this.isOrganizer = user?.username === 'organisateur';
        });

        this.socketCommunicationService.onGameStarted(() => {
            this.startGameCountdown();
        });

        this.socketCommunicationService.onRoomClosed(() => {
            this.dialogError.closeAlertDialog();
            this.dialogError.openErrorDialog(this.isOrganizer ? ErrorMessages.QuitRoom : ErrorMessages.ClosedRoom);
            this.socketCommunicationService.leaveRoom();
            this.router.navigate(['/']);
        });
    }

    getQuizName(): void {
        const statsObservable = this.socketCommunicationService.getStats();
        if (statsObservable) {
            statsObservable.subscribe({
                next: (value) => {
                    this.quizName = value.name;
                },
            });
        }
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
        this.socketCommunicationService.attemptStartGame(this.roomCode).subscribe((open) => {
            if (!open) {
                const errorMessage = this.roomLocked ? ErrorMessages.NoPlayer : ErrorMessages.NotLockRoom;
                this.dialogError.openErrorDialog(errorMessage);
            }
        });
    }

    startGameCountdown(): void {
        this.gameStarted = true;
        this.countdownService.startCountdown(this.countdownValue);
        if (this.countdownService.countdownTick) {
            this.countdownSubscription = this.countdownService.countdownTick.subscribe((value) => {
                this.countdownValue = value;
                this.changeDetectorRef.detectChanges();
            });
        }
        if (this.countdownService.countdownEnded) {
            this.countdownSubscription.add(
                this.countdownService.countdownEnded.subscribe(() => {
                    this.router.navigate(['/game/play']);
                }),
            );
        }
    }

    ngOnDestroy(): void {
        this.lobbySubscription?.unsubscribe();
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
        }
        this.countdownService.stopCountdown();
    }
}
