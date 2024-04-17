import { Component, OnInit } from '@angular/core';
import { GameStats, PlayerInfo, QuestionStats } from '@app/interfaces/game-stats';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent implements OnInit {
    protected gameStats: GameStats = {
        id: '',
        questions: [],
        duration: 0,
        users: [],
        name: '',
    };
    protected playerSubject: PlayerInfo[];
    protected selectedQuestion = new Subject<QuestionStats>();
    protected totalQuestions: number;
    protected questionIndex: number = 0;
    private subscription: Subscription;

    constructor(
        private socketService: SocketCommunicationService,
        private gameService: GameService,
    ) {}

    ngOnInit(): void {
        this.subscription = this.socketService.getStats().subscribe({
            next: (value) => {
                this.gameStats = value;
                this.playerSubject = this.gameStats.users;
                this.selectedQuestion.next(this.gameStats.questions[0]);
                this.totalQuestions = this.gameStats.questions.length;
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
}
