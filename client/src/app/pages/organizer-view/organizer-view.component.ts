import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { GameStats, PlayerInfo, QuestionStats, TimePackage } from '@app/interfaces/game-stats';
import { Naviguation } from '@app/interfaces/socket-model';
import { AudioService } from '@app/services/audio-handler/audio.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { StatService } from '@app/services/stats/stats.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject, Subscription } from 'rxjs';

const QRL_DURATION = 60;

@Component({
    selector: 'app-organizer-view',
    templateUrl: './organizer-view.component.html',
    styleUrls: ['./organizer-view.component.scss'],
    providers: [TimeService],
})
export class OrganizerViewComponent implements OnInit, OnChanges, OnDestroy {
    @Input() questionTimePackage: TimePackage = {} as TimePackage;
    @Output() endTimerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    gameStats: GameStats;
    questionStats: Subject<QuestionStats> = new Subject<QuestionStats>();
    isRoundOver: boolean = false;
    text: string;
    points: number;
    usersAnswer: PlayerInfo[] = [];
    users: PlayerInfo[] = [];
    isPaused: boolean = false;
    isPanic: boolean = false;
    isQrlCorrection: boolean = false;
    answerIndex: number = 0;
    disableBtns: boolean = false;
    private duration: number;
    private timerSubscription: Subscription | undefined;
    private answerSubscription: Subscription;
    private socketSubscription: Subscription;

    /* eslint-disable max-params */
    constructor(
        private timeService: TimeService,
        public router: Router,
        private socketService: SocketCommunicationService,
        private audioService: AudioService,
        private statsService: StatService,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.answerSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart && event.navigationTrigger === Naviguation.Back) this.socketService.disconnect();
        });
        this.gameStats = {
            id: '',
            duration: 0,
            questions: [],
            users: [],
            name: '',
        };
        this.handleUserAnswerChanging();
        this.handleUserLeaving();
        this.handleRoundEnding();
        this.handleCorrectingQrl();
        this.handleEnablingPanicMode();
    }

    pauseTimer() {
        this.isPaused = !this.isPaused;
        this.socketService.pauseTimer();
    }

    paniqueMode() {
        this.socketService.paniqueMode(this.questionTimePackage.currentQuestionIndex, this.timeService.time);
    }

    givePoints(pointsGiven: number, percentageGiven: string) {
        this.socketService.givePoints(
            pointsGiven * this.questionTimePackage.question.points,
            this.users[this.answerIndex].name,
            percentageGiven,
            this.questionTimePackage.currentQuestionIndex,
        );
        this.answerIndex += 1;
        if (this.users.length === this.answerIndex) {
            this.isQrlCorrection = false;
            this.socketService.endCorrection(this.questionTimePackage.currentQuestionIndex);
        }
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question) {
            this.isRoundOver = false;
            this.isPaused = false;
            this.text = this.questionTimePackage.question.text;
            if (this.questionTimePackage.question.type === 'QCM') {
                this.duration = this.questionTimePackage.time;
            } else if (this.questionTimePackage.question.type === 'QRL') this.duration = QRL_DURATION;
            this.points = this.questionTimePackage.question.points;
            this.disableBtns = false;
            this.timeService.stopTimer();
            this.startTimer();
            this.requestUpdatedStats();
            this.timerSubscription = this.timeService.timerEvent.subscribe(() => {
                this.socketService.roundOver(this.questionTimePackage.currentQuestionIndex);
                this.isRoundOver = true;
            });
        }
    }
    ngOnDestroy(): void {
        if (this.timerSubscription) this.timerSubscription.unsubscribe();
        if (this.answerSubscription) this.answerSubscription.unsubscribe();
    }
    startTimer() {
        this.timeService.startTimer(this.duration);
    }
    nextQuestion() {
        this.isPanic = false;
        if (this.questionTimePackage.question.type === 'QRL') this.socketService.changeQrlQuestion(this.questionTimePackage.currentQuestionIndex);
        this.socketService.nextQuestion();
    }
    showResults() {
        this.socketService.endGame();
        if (this.questionTimePackage.question.type === 'QRL') this.socketService.changeQrlQuestion(this.questionTimePackage.currentQuestionIndex);
    }
    navigateHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
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

    updateUsersList(users: PlayerInfo[]) {
        const newUsersSet = new Set(users);
        const currentUsersSet = new Set(this.users);

        this.users = [...this.users.filter((user) => newUsersSet.has(user)), ...users.filter((user) => !currentUsersSet.has(user))];
    }

    sortUsersAnswers(users: PlayerInfo[]) {
        this.usersAnswer = this.statsService.sortPlayerByUserName(users, true);
    }

    handleUserLeaving() {
        this.socketService.onUserLeft((username: string) => {
            this.users = this.users.map((user) => {
                if (user.name === username) return { ...user, hasLeft: true };
                return user;
            });
        });
    }

    handleRoundEnding() {
        this.socketService.onEndRound(() => {
            this.isRoundOver = true;
            this.disableBtns = true;
            this.socketService.getStats().subscribe({
                next: (value) => {
                    this.users = value.users;
                },
            });
            this.timeService.stopTimer();
        });
    }

    handleCorrectingQrl() {
        this.socketService.onCorrectQrlQuestions(() => {
            this.timeService.stopTimer();
            this.socketService.getStats().subscribe({
                next: (value) => {
                    this.sortUsersAnswers(value.users);
                },
            });
            this.isQrlCorrection = true;
        });
    }

    handleEnablingPanicMode() {
        this.socketService.onPanicEnabled((isPanicEnabled: boolean) => {
            this.isPanic = isPanicEnabled;
            if (isPanicEnabled) {
                this.isPaused = false;
                this.audioService.playAudio();
            }
        });
    }

    handleUserAnswerChanging() {
        this.socketService.onAnswerChange((stats) => {
            this.questionStats.next(stats);
        });
    }
}
