import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { GameStats, PlayerInfo, QuestionStats, TimePackage } from '@app/interfaces/game-stats';
import { Naviguation } from '@app/interfaces/socket-model';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject, Subscription } from 'rxjs';

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
    duration: number;
    text: string;
    points: number;
    users: PlayerInfo[] = [];
    removedUsers: PlayerInfo[] = [];
    timerSubscription: Subscription | undefined;
    private answerSubscription: Subscription;
    private socketSubscription: Subscription;
    constructor(
        private timeService: TimeService,
        public router: Router,
        private socketService: SocketCommunicationService,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.answerSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart && event.navigationTrigger === Naviguation.Back) this.socketService.disconnect();
        });
        this.socketService.onAnswerChange((stats) => {
            this.questionStats.next(stats);
        });
        this.gameStats = {
            id: '',
            duration: 0,
            questions: [],
            users: [],
            name: '',
        };

        this.socketService.onUserLeft((username: string) => {
            this.users = this.users.map((user) => {
                if (user.name === username) return { ...user, hasLeft: true };
                return user;
            });
        });

        this.socketService.onEndRound(() => {
            this.isRoundOver = true;
            this.socketService.getStats().subscribe({
                next: (value) => {
                    this.users = value.users;
                },
            });
            this.timeService.stopTimer();
        });
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question) {
            this.isRoundOver = false;
            this.text = this.questionTimePackage.question.text;
            this.duration = this.questionTimePackage.time;
            this.points = this.questionTimePackage.question.points;
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
        this.socketService.nextQuestion();
    }
    showResults() {
        this.socketService.endGame();
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

        this.removedUsers = this.users.filter((user) => !newUsersSet.has(user));
        this.users = [...this.users.filter((user) => newUsersSet.has(user)), ...users.filter((user) => !currentUsersSet.has(user))];
    }
}
