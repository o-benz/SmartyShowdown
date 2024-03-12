import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PLACEHOLDER_GAME_STATS } from '@app/services/constants';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { of } from 'rxjs';
import { QuestionStatsComponent } from './question-stats.component';

describe('QuestionStatsComponent', () => {
    let component: QuestionStatsComponent;
    let fixture: ComponentFixture<QuestionStatsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionStatsComponent],
            imports: [CommonModule, RouterOutlet, CanvasJSAngularChartsModule],
        });
        fixture = TestBed.createComponent(QuestionStatsComponent);
        component = fixture.componentInstance;
        component.stats = of(PLACEHOLDER_GAME_STATS.questions[0]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
