import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameStats, PlayerInfo, QuestionStats, TimePackage } from '@app/interfaces/game-stats';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Observable, Subscription, of } from 'rxjs';

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
    questionStats: Observable<QuestionStats> = new Observable<QuestionStats>();
    isRoundOver: boolean = false;
    duration: number;
    text: string;
    points: number;
    users: PlayerInfo[] = [];
    removedUsers: PlayerInfo[] = [];
    timerSubscription: Subscription | undefined;
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
        this.gameStats = {
            id: '',
            duration: 0,
            questions: [],
            users: [],
        };
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
                this.socketService.roundOver();
                this.isRoundOver = true;
            });
            this.socketService.onEndRound(() => {
                this.isRoundOver = true;
            });
        }
    }
    ngOnDestroy(): void {
        this.timerSubscription?.unsubscribe();
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
        this.router.navigate(['/home']);
    }
    requestUpdatedStats() {
        this.socketSubscription = this.socketService.getStats().subscribe({
            next: (gameStats) => {
                this.gameStats = gameStats;
                this.questionStats = of(gameStats.questions[this.questionTimePackage.currentQuestionIndex]);
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
