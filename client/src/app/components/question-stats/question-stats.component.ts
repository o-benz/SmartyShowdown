import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { QuestionStats } from '@app/interfaces/game-stats';
import { DataPoint } from '@app/interfaces/quiz-model';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-question-stats',
    templateUrl: './question-stats.component.html',
    styleUrls: ['./question-stats.component.scss'],
})
export class QuestionStatsComponent implements OnInit, OnDestroy {
    @Input() stats: Observable<QuestionStats> = new Observable<QuestionStats>();
    subscription: Subscription;
    dataPoints: DataPoint[] = [];
    maxValue: number = 1;
    title: string;

    ngOnInit(): void {
        this.subscription = this.stats.subscribe((question: QuestionStats) => {
            this.title = question.title;
            this.maxValue = 1;
            this.dataPoints = question.statLines.map((statLine, index) => ({
                label: statLine.label,
                y: statLine.nbrOfSelection,
                isCorrect: statLine.isCorrect,
                x: index,
            }));

            this.dataPoints.forEach((dataPoint) => {
                if (dataPoint.y > this.maxValue) {
                    this.maxValue = dataPoint.y;
                }
            });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
