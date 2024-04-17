import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { BaseQuestion } from '@app/interfaces/question-model';
import { CountdownService } from '@app/services/countdown/countdown.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-result-popup',
    templateUrl: './result-popup.component.html',
    styleUrls: ['./result-popup.component.scss'],
    providers: [TimeService],
})
export class ResultPopupComponent implements OnChanges, OnDestroy {
    @Input() questionBooleanPackage: { isAnswerCorrect: boolean; question: BaseQuestion; isLastQuestion?: boolean };
    @Input() mode: string;
    @Input() isRandom: boolean;
    @Output() nextQuestionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    popupDuration: number = 3;

    countdownEndedSubscription: Subscription;
    countdownTickSubscription: Subscription;

    protected isFirstAnswer: boolean = false;
    // eslint-disable-next-line max-params
    constructor(
        private dialogAlertService: DialogAlertService,
        private countDownService: CountdownService,
        private changeDetectorRef: ChangeDetectorRef,
        private socketService: SocketCommunicationService,
        private gameService: GameService,
    ) {}

    ngOnChanges(): void {
        this.isFirstAnswer = false;
        if (this.isRandom) {
            this.socketService.getUser().subscribe({
                next: (value) => {
                    this.gameService.previousScore = this.gameService.score;
                    this.gameService.score = value.score ?? 0;
                    if (this.gameService.score - this.gameService.previousScore > this.questionBooleanPackage.question.points)
                        this.isFirstAnswer = true;
                    this.makePopup();
                },
            });
        } else {
            this.makePopup();
        }
    }

    makePopup() {
        this.dialogAlertService.closeAlertDialog();
        this.initCountdown();
    }

    ngOnDestroy(): void {
        this.countdownEndedSubscription?.unsubscribe();
        this.countdownTickSubscription?.unsubscribe();
    }

    initCountdown(): void {
        this.countDownService.stopCountdown();
        this.countDownService.startCountdown(this.popupDuration);

        this.countdownEndedSubscription = this.countDownService.countdownEnded.subscribe(() => {
            this.nextQuestion();
        });

        this.countdownTickSubscription = this.countDownService.countdownTick.subscribe((value) => {
            this.popupDuration = value;
            this.changeDetectorRef.detectChanges();
        });
    }

    nextQuestion(): void {
        this.questionBooleanPackage.isAnswerCorrect = false;
        this.nextQuestionEvent.emit(false);
    }
}
