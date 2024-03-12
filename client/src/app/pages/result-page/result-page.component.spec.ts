import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerListResultComponent } from '@app/components/player-list-result/player-list-result.component';
import { QuestionStatsComponent } from '@app/components/question-stats/question-stats.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ResultPageComponent } from './result-page.component';

describe('ResultPageComponent', () => {
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultPageComponent, PlayerListResultComponent, QuestionStatsComponent, HeaderComponent, ChatBoxComponent],
            imports: [CommonModule, RouterOutlet, CanvasJSAngularChartsModule],
        });
        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
