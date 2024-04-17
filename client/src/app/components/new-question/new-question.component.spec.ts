import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BaseQuestion, Question, TypeEnum } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { of } from 'rxjs';
import { NewQuestionComponent } from './new-question.component';

describe('NewQuestionComponent', () => {
    let component: NewQuestionComponent;
    let fixture: ComponentFixture<NewQuestionComponent>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let mockDialogAlertService: jasmine.SpyObj<DialogAlertService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockQuestionService = jasmine.createSpyObj('QuestionService', [
            'addMultipleChoice',
            'checkValidity',
            'getAllQuestions',
            'getQuestionsByType',
        ]);
        mockDialogAlertService = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog']);
        mockQuestionService.getAllQuestions.and.returnValue(of([{}] as BaseQuestion[]));
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed'], ['confirm']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        await TestBed.configureTestingModule({
            declarations: [NewQuestionComponent],
            providers: [
                { provide: QuestionService, useValue: mockQuestionService },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DialogAlertService, useValue: mockDialogAlertService },
            ],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NewQuestionComponent);
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

    it('should save Question', () => {
        const isValid = true;
        component['newQuestion'] = {
            text: 'Sample Question',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        mockQuestionService.checkValidity.and.returnValue(of(isValid));

        component.addQuestionToQuiz(component['newQuestion']);

        expect(mockQuestionService.checkValidity).toHaveBeenCalledWith(component['newQuestion']);
        expect(component.quizModified.questions.length).toBe(1);
    });

    it('should not save QCM if question is invalid', () => {
        const isValid = false;
        mockQuestionService.checkValidity.and.returnValue(of(isValid));

        component.addQuestionToQuiz(component['newQuestion']);

        expect(mockQuestionService.checkValidity).toHaveBeenCalledWith(component['newQuestion']);
        expect(component.quizModified.questions.length).toBe(0);
    });

    it('should open new question dialog', () => {
        const dialogRefMock = { afterClosed: () => of(null) };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockMatDialog.open.and.returnValue(dialogRefMock as any);

        component.createQuestion();

        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should add question to quiz if result is provided', () => {
        const baseQuestion = { id: '123', text: 'Sample Question' };
        const dialogRefMock = { afterClosed: () => of(baseQuestion) };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockMatDialog.open.and.returnValue(dialogRefMock as any);
        spyOn(component, 'addQuestionToQuiz');

        component.createQuestion();

        expect(component.addQuestionToQuiz).toHaveBeenCalled();
    });

    it('should set filter state and call updateQuestionsList', () => {
        const state = TypeEnum.QCM;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'updateQuestionsList');
        component['setFilterState'](state);
        expect(component['filterState']).toEqual(state);
        expect(spy).toHaveBeenCalled();
    });

    it('should update questions list correctly', () => {
        component['filterState'] = TypeEnum.QCM;
        const questions: Question[] = [];
        mockQuestionService.getQuestionsByType.and.returnValue(of(questions));

        component['updateQuestionsList']();

        expect(mockQuestionService.getQuestionsByType).toHaveBeenCalled();
    });
});
