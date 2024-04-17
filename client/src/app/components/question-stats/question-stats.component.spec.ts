import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { QuestionStats } from '@app/interfaces/game-stats';
import { games } from '@app/interfaces/quiz';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { BehaviorSubject, of } from 'rxjs';
import { QuestionStatsComponent } from './question-stats.component';

describe('QuestionStatsComponent', () => {
    let component: QuestionStatsComponent;
    let fixture: ComponentFixture<QuestionStatsComponent>;
    let mockStats: BehaviorSubject<QuestionStats>;

    beforeEach(() => {
        mockStats = new BehaviorSubject<QuestionStats>({
            title: 'Question Title',
            type: 'QCM',
            points: 10,
            statLines: [
                { label: 'Option A', nbrOfSelection: 3, isCorrect: true },
                { label: 'Option B', nbrOfSelection: 5, isCorrect: false },
            ],
        });
        TestBed.configureTestingModule({
            declarations: [QuestionStatsComponent],
            imports: [CommonModule, RouterOutlet, CanvasJSAngularChartsModule],
        });
        fixture = TestBed.createComponent(QuestionStatsComponent);
        component = fixture.componentInstance;
        component.stats = mockStats;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set properties based on emitted value from stats', () => {
        component.ngOnInit();

        expect(component.title).toEqual('Question Title');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.maxValue).toEqual(5);
        expect(component.dataPoints).toEqual([
            { label: 'Option A', y: 3, isCorrect: true, x: 0 },
            { label: 'Option B', y: 5, isCorrect: false, x: 1 },
        ]);
    });

    it('should unsubscribe when ngOnDestroy is called', () => {
        component.subscription = of(games[0].questions[0]).subscribe();
        const spy = spyOn(component.subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });
});
