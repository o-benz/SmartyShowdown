import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from '@app/components/header/header.component';
import { ImportQuizComponent } from '@app/components/import-quiz/import-quiz.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminPageComponent, QuizListComponent, HeaderComponent, ImportQuizComponent],
            imports: [MatDialogModule, HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
