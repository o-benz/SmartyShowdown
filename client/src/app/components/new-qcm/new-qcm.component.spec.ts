import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Question } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { QuestionService } from '@app/services/question/question.service';
import { of } from 'rxjs';
import { NewQcmComponent } from './new-qcm.component';

describe('NewQcmComponent', () => {
    let component: NewQcmComponent;
    let fixture: ComponentFixture<NewQcmComponent>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let mockDialogErrorService: jasmine.SpyObj<DialogErrorService>;

    beforeEach(async () => {
        mockQuestionService = jasmine.createSpyObj('QuestionService', ['addMultipleChoice', 'checkValidity', 'getAllQuestions']);
        mockDialogErrorService = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog']);
        mockQuestionService.getAllQuestions.and.returnValue(of([{}] as Question[]));
        await TestBed.configureTestingModule({
            declarations: [NewQcmComponent],
            providers: [
                { provide: QuestionService, useValue: mockQuestionService },
                MatDialog,
                { provide: DialogErrorService, useValue: mockDialogErrorService },
            ],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NewQcmComponent);
        component = fixture.componentInstance;
        component.quizModified = {
            id: '1',
            visible: true,
            title: 'Sample Quiz',
            description: 'Sample Quiz Description',
            duration: 60,
            lastModification: '2024-02-08T12:00:00',
            questions: [],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add multiple choice', () => {
        const text = 'Sample text';
        const isCorrect = true;

        component.addMultipleChoice(text, isCorrect);

        expect(mockQuestionService.addMultipleChoice).toHaveBeenCalledWith({ text, isCorrect }, component['newQuestion']);
    });

    it('should save QCM', () => {
        const isValid = true;
        mockQuestionService.checkValidity.and.returnValue(of(isValid));

        component.saveQCM();

        expect(mockQuestionService.checkValidity).toHaveBeenCalledWith(component['newQuestion']);
        expect(component.quizModified.questions.length).toBe(1);
    });

    it('should not save QCM if question is invalid', () => {
        const isValid = false;
        mockQuestionService.checkValidity.and.returnValue(of(isValid));

        component.saveQCM();

        expect(mockQuestionService.checkValidity).toHaveBeenCalledWith(component['newQuestion']);
        expect(component.quizModified.questions.length).toBe(0);
    });
});
