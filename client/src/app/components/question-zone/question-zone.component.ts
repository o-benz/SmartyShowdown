import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Subscription } from 'rxjs';
import { RightAnswerPopupComponent } from '../right-answer-popup/right-answer-popup.component';

@Component({
    selector: 'app-question-zone',
    templateUrl: './question-zone.component.html',
    styleUrls: ['./question-zone.component.scss'],
    providers: [TimeService],
})
export class QuestionZoneComponent implements OnChanges, OnInit {
    @Input() questionTimePackage: { time: number; question: Question; isTimeOver: boolean; mode: string; isOrganizer?: boolean };
    @Output() endTimerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    duration: number;
    text: string;
    points: number;
    score = 0;
    previousScore = 0;
    timerSubscription: Subscription | undefined;
    constructor(
        private timeService: TimeService,
        public router: Router,
        private socketService: SocketCommunicationService,
        private dialogErrorService: DialogErrorService,
        private gameService: GameService,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.socketService.onEndRound(() => {
            this.socketService.getUser().subscribe({
                next: (value) => {
                    this.previousScore = this.score;
                    this.score = value.score ?? 0;
                    if (!this.questionTimePackage.isOrganizer) {
                        this.dialogErrorService.openCustomDialog(
                            this.gameService.getAnswers(this.questionTimePackage.question),
                            RightAnswerPopupComponent,
                            this.score - this.previousScore,
                            this.score,
                        );
                    }
                },
            });
            this.timeService.stopTimer();
        });
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question) {
            if (!this.questionTimePackage.isTimeOver) {
                this.text = this.questionTimePackage.question.text;
                this.duration = this.questionTimePackage.time;
                if (this.questionTimePackage.mode === 'test') this.score = this.gameService.score;
                this.points = this.questionTimePackage.question.points;
                this.timeService.stopTimer();
                this.startTimer();
            }
        }
    }
    startTimer() {
        this.timeService.startTimer(this.duration);
    }
    navigateHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }
}
