import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from '@app/components/header/header.component';
import { HistoricComponent } from '@app/components/historic/historic.component';
import { ImportQuizComponent } from '@app/components/import-quiz/import-quiz.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, QuizListComponent, HeaderComponent, HistoricComponent, ImportQuizComponent, QuestionListComponent],
            imports: [MatDialogModule, NoopAnimationsModule, HttpClientTestingModule],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have empty quiz and historic games list on init', () => {
        expect(component.quizList).toBeUndefined();
        expect(component.historicGames).toBeUndefined();
    });
});
