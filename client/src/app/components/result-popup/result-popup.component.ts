import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Question } from '@app/interfaces/quiz-model';
import { TimeService } from '@app/services/time/time.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-result-popup',
    templateUrl: './result-popup.component.html',
    styleUrls: ['./result-popup.component.scss'],
    providers: [TimeService],
})
export class ResultPopupComponent implements OnChanges, OnDestroy {
    @Input() questionBooleanPackage: { isAnswerCorrect: boolean; question: Question };
    @Output() nextQuestionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    popupDuration: number = 3;
    private timerSubscription: Subscription;

    constructor(private timeService: TimeService) {}
    get time(): number {
        return this.timeService.time;
    }

    ngOnChanges(): void {
        this.timerInit();
        this.timerSubscription = this.timeService.timerEvent.subscribe(() => {
            this.nextQuestion();
        });
    }

    ngOnDestroy(): void {
        this.timerSubscription?.unsubscribe();
    }
    timerInit(): void {
        this.timeService.stopTimer();
        this.timeService.startTimer(this.popupDuration);
    }
    nextQuestion(): void {
        this.questionBooleanPackage.isAnswerCorrect = false;
        this.nextQuestionEvent.emit(false);
    }
}
