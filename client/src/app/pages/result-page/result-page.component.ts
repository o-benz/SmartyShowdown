import { Component, OnInit } from '@angular/core';
import { GameStats, PlayerInfo, QuestionStats } from '@app/interfaces/game-stats';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { StatService } from '@app/services/stats/stats.service';
import { Observable, Subject, Subscription, of } from 'rxjs';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent implements OnInit {
    protected gameStats: GameStats;
    protected playerSubject: Observable<PlayerInfo[]>;
    protected selectedQuestion = new Subject<QuestionStats>();
    private questionIndex: number = 0;
    private subscription: Subscription;

    constructor(
        private socketService: SocketCommunicationService,
        private gameService: GameService,
    ) {}

    ngOnInit(): void {
        this.subscription = this.socketService.getStats().subscribe({
            next: (value) => {
                this.gameStats = value;
                this.gameStats.users = this.sortPlayerByPoints(this.gameStats.users);
                this.playerSubject = of(StatService.sortPlayerByPoints(this.gameStats.users));
                this.selectedQuestion.next(this.gameStats.questions[0]);
            },
            complete: () => {
                if (this.subscription) this.subscription.unsubscribe();
            },
        });
    }

    changeDiagram(direction: number) {
        if (this.gameService.staysInInterval(this.gameStats.questions.length, this.questionIndex + direction)) {
            this.questionIndex += direction;
            this.selectedQuestion.next(this.gameStats.questions[this.questionIndex]);
        }
    }

    sortPlayerByPoints(users: PlayerInfo[]): PlayerInfo[] {
        return users.sort((a, b) => {
            if ((a.score ?? 0) > (b.score ?? 0)) return -1;
            if ((a.score ?? 0) < (b.score ?? 0)) return 1;
            return a.name.localeCompare(b.name);
        });
    }
}
