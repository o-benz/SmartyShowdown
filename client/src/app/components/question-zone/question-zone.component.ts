import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RightAnswerPopupComponent } from '@app/components/right-answer-popup/right-answer-popup.component';
import { GameStats, PlayerInfo, QuestionStats, QuestionTimePackage } from '@app/interfaces/game-stats';
import { AudioService } from '@app/services/audio-handler/audio.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject, Subscription } from 'rxjs';

const QRL_DURATION = 60;

@Component({
    selector: 'app-question-zone',
    templateUrl: './question-zone.component.html',
    styleUrls: ['./question-zone.component.scss'],
    providers: [TimeService],
})
export class QuestionZoneComponent implements OnChanges, OnInit, OnDestroy {
    @Input() questionTimePackage: QuestionTimePackage;
    @Input() isRandom: boolean;
    @Output() endTimerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    duration: number;
    text: string;
    points: number;
    gameStats: GameStats;
    questionStats: Subject<QuestionStats> = new Subject<QuestionStats>();
    score = 0;
    users: PlayerInfo[] = [];
    removedUsers: PlayerInfo[] = [];
    previousScore = 0;
    timerSubscription: Subscription | undefined;
    private gameSubscription: Subscription | undefined;
    private socketSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private timeService: TimeService,
        public router: Router,
        private socketService: SocketCommunicationService,
        private dialogAlertService: DialogAlertService,
        private gameService: GameService,
        private audioService: AudioService,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.gameStats = {
            id: '',
            duration: 0,
            questions: [],
            users: [],
            name: '',
        };

        this.handleQrlQuestionCorrection();
        this.handleRoundEnd();

        this.socketService.onPanicEnabled((isPanicEnabled: boolean) => {
            if (isPanicEnabled) this.audioService.playAudio();
        });
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question) {
            if (!this.questionTimePackage.isTimeOver) {
                if (this.questionTimePackage.question.type === 'QCM') this.duration = this.questionTimePackage.time;
                else if (this.questionTimePackage.question.type === 'QRL') this.duration = QRL_DURATION;

                this.text = this.questionTimePackage.question.text;
                this.points = this.questionTimePackage.question.points;

                this.timeService.stopTimer();
                this.startTimer();
                if (this.questionTimePackage.mode === 'test') {
                    this.timerSubscription = this.timeService.timerEvent.subscribe(() => {
                        this.lockAnswer();
                    });
                }
                if (this.isRandom) {
                    this.requestUpdatedStats();
                    this.timerSubscription = this.timeService.timerEvent.subscribe(() => {
                        this.socketService.roundOver(this.questionTimePackage.currentQuestionIndex);
                        if (this.timerSubscription) this.timerSubscription.unsubscribe();
                    });
                }
            }
            if (this.questionTimePackage.mode === 'test') this.score = this.gameService.score;
        }
    }
    ngOnDestroy(): void {
        if (this.timerSubscription) this.timerSubscription.unsubscribe();
        this.gameSubscription?.unsubscribe();
    }
    startTimer() {
        this.timeService.startTimer(this.duration);
    }
    navigateHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }
    showResults() {
        this.socketService.endGame();
    }
    updateUsersList(users: PlayerInfo[]) {
        const newUsersSet = new Set(users);
        const currentUsersSet = new Set(this.users);

        this.removedUsers = this.users.filter((user) => !newUsersSet.has(user));
        this.users = [...this.users.filter((user) => newUsersSet.has(user)), ...users.filter((user) => !currentUsersSet.has(user))];
    }
    requestUpdatedStats() {
        this.socketSubscription = this.socketService.getStats().subscribe({
            next: (gameStats) => {
                this.gameStats = gameStats;
                this.questionStats.next(gameStats.questions[this.questionTimePackage.currentQuestionIndex]);
                this.updateUsersList(gameStats.users);
            },
            complete: () => {
                if (this.socketSubscription) this.socketSubscription.unsubscribe();
            },
        });
    }

    lockAnswer() {
        this.gameSubscription = this.gameService.postCurrentChoices(this.questionTimePackage.question.text).subscribe((isAnswerCorrect: boolean) => {
            this.endTimerEvent.emit(isAnswerCorrect);
        });
    }

    handleQrlQuestionCorrection() {
        this.socketService.onCorrectQrlQuestions(() => {
            this.socketService.getUser().subscribe({
                next: (value) => {
                    if (value.username !== 'organisateur') {
                        this.dialogAlertService.openErrorDialog('Veuillez attendre la correction');
                    }
                },
            });
            this.timeService.stopTimer();
        });
    }

    handleRoundEnd() {
        this.socketService.onEndRound(() => {
            this.socketService.getUser().subscribe({
                next: (value) => {
                    this.previousScore = this.score;
                    this.score = value.score ?? 0;
                    if (value.username !== 'organisateur' && !this.isRandom) {
                        this.dialogAlertService.openCustomDialog({
                            message: this.gameService.getAnswers(this.questionTimePackage.question),
                            dialogComponent: RightAnswerPopupComponent,
                            points: this.score - this.previousScore,
                            score: this.score,
                            questionPoints: this.questionTimePackage.question.points,
                        });
                    } else if (this.isRandom) {
                        if (this.questionTimePackage.currentQuestionIndex === this.gameStats.questions.length - 1) {
                            this.endTimerEvent.emit(this.score - this.previousScore > 0);
                            this.showResults();
                        } else {
                            this.endTimerEvent.emit(this.score - this.previousScore > 0);
                            if (value.username === 'organisateur') this.socketService.nextQuestion();
                        }
                    }
                },
            });
            this.timeService.stopTimer();
        });
    }
}
