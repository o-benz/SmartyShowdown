import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { TimeService } from '@app/services/time/time.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-zone',
    templateUrl: './question-zone.component.html',
    styleUrls: ['./question-zone.component.scss'],
    providers: [TimeService],
})
export class QuestionZoneComponent implements OnChanges, Question, OnDestroy {
    @Input() questionTimePackage: { time: number; question: Question };
    @Output() endTimerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    questionIndex: number = 0;
    duration: number;
    text: string;
    type: string;
    points: number;
    buttonPressed = '';
    score = 0;
    timerSubscription: Subscription | undefined;
    private gameSubscription: Subscription | undefined;
    constructor(
        private timeService: TimeService,
        private gameService: GameService,
        public router: Router,
    ) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnChanges(): void {
        if (this.questionTimePackage.question !== undefined) {
            this.text = this.questionTimePackage.question.text;
            this.duration = this.questionTimePackage.time;
            this.score = this.gameService.score;
            this.points = this.questionTimePackage.question.points;
            this.timeService.stopTimer();
            this.startTimer();
            this.timerSubscription = this.timeService.timerEvent.subscribe(() => {
                this.nextQuestion();
            });
        }
    }
    ngOnDestroy(): void {
        this.timerSubscription?.unsubscribe();
        this.gameSubscription?.unsubscribe();
    }
    startTimer() {
        this.timeService.startTimer(this.duration);
    }
    nextQuestion() {
        this.gameSubscription = this.gameService.postCurrentChoices(this.questionTimePackage.question).subscribe((isAnswerCorrect: boolean) => {
            this.endTimerEvent.emit(isAnswerCorrect);
        });
    }
    navigateHome() {
        this.router.navigate(['/home']);
    }
}
