import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from '@app/components/header/header.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { AdminQuestionHandlerService } from '@app/services/mcq-handler/mcq-handler.service';
import { QuestionBankComponent } from './question-bank.component';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankComponent, HeaderComponent, QuestionListComponent],
            providers: [{ provide: QuestionListComponent, useValue: QuestionListComponent }, AdminQuestionHandlerService],
            imports: [HttpClientTestingModule, MatDialogModule],
        });
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
