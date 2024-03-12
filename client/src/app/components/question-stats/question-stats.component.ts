import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { QuestionStats } from '@app/interfaces/game-stats';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-question-stats',
    templateUrl: './question-stats.component.html',
    styleUrls: ['./question-stats.component.scss'],
})
export class QuestionStatsComponent implements OnInit, OnDestroy {
    @Input() stats: Observable<QuestionStats> = new Observable<QuestionStats>();
    subscription: Subscription;
    chartInstance: { render: () => void };
    chartOptions = {
        title: {
            text: 'Faite défiler les questions avec les boutons',
        },
        data: [
            {
                type: 'column',
                dataPoints: [{}],
            },
        ],
    };
    // eslint-disable-next-line
    getChartInstance(chart: any) { // chartJS doesnt have up to date type definition for this object
        this.chartInstance = chart;
        this.chartInstance.render();
    }

    ngOnInit(): void {
        this.subscription = this.stats.subscribe((question: QuestionStats) => {
            this.chartOptions.title.text = question.title;
            this.chartOptions.data[0].dataPoints = question.statLines;
            this.chartInstance.render();
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
