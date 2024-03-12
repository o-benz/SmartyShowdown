import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { TimeService } from '@app/services/time/time.service';

@Component({
    selector: 'app-question-zone',
    templateUrl: './question-zone.component.html',
    styleUrls: ['./question-zone.component.scss'],
    providers: [TimeService],
})
export class QuestionZoneComponent implements OnChanges {
    @Input() questionTimePackage: { time: number; question: Question; isTimeOver: boolean };
    duration: number;
    text: string;
    points: number;
    score = 0;
    constructor(
        private timeService: TimeService,
        private gameService: GameService,
        public router: Router,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question) {
            if (!this.questionTimePackage.isTimeOver) {
                this.text = this.questionTimePackage.question.text;
                this.duration = this.questionTimePackage.time;
                this.score = this.gameService.score;
                this.points = this.questionTimePackage.question.points;
                this.timeService.stopTimer();
                this.startTimer();
            } else this.score = this.gameService.score;
        }
    }
    startTimer() {
        this.timeService.startTimer(this.duration);
    }
    navigateHome() {
        this.router.navigate(['/home']);
    }
}
