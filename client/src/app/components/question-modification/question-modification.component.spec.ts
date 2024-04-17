import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ErrorMessages, SuccessMessages } from '@app/interfaces/alert-messages';
import { Question } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subject, of } from 'rxjs';
import { QuestionModificationComponent } from './question-modification.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionModificationComponent', () => {
    let component: QuestionModificationComponent;
    let fixture: ComponentFixture<QuestionModificationComponent>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let questionServiceSpy: SpyObj<QuestionService>;
    let mockDialogAlertService: jasmine.SpyObj<DialogAlertService>;

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', [
            'addMultipleChoice',
            'deleteQuizQuestion',
            'placeHigher',
            'placeLower',
            'addQuestionToBank',
            'checkValidity',
        ]);
        mockDialogAlertService = jasmine.createSpyObj('DialogAlertService', ['openSuccessDialog', 'openErrorDialog']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed'], ['confirm']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);

        questionServiceSpy.checkValidity.and.returnValue(of(true));

        TestBed.configureTestingModule({
            declarations: [QuestionModificationComponent],
            imports: [MatDialogModule, HttpClientModule, FormsModule],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: DialogAlertService, useValue: mockDialogAlertService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionModificationComponent);
        component = fixture.componentInstance;
        component.question = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call deleteQuestion', () => {
        component.deleteQuizQuestion();
        expect(questionServiceSpy.deleteQuizQuestion).toHaveBeenCalled();
    });

    it('should call placeQuestionHigher', () => {
        component.placeQuestionHigher();
        expect(questionServiceSpy.placeHigher).toHaveBeenCalled();
    });

    it('should call placeQuestionLower', () => {
        component.placeQuestionLower();
        expect(questionServiceSpy.placeLower).toHaveBeenCalled();
    });

    it('should call addToBank', () => {
        questionServiceSpy.addQuestionToBank.and.returnValue(of());
        component.addToBank(component.question);
        expect(questionServiceSpy.addQuestionToBank).toHaveBeenCalled();
    });

    it('addToBank should should call addQuestionToBank and openSuccessDialog on success)', () => {
        const mockQuestion = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };
        const mockResponse = {
            date: new Date(),
            _id: '',
            ...mockQuestion,
        };
        questionServiceSpy.addQuestionToBank.and.returnValue(of(mockResponse));
        component.addToBank(component.question);
        expect(questionServiceSpy.addQuestionToBank).toHaveBeenCalledWith(mockQuestion);
        expect(mockDialogAlertService.openSuccessDialog).toHaveBeenCalledWith(SuccessMessages.QuestionBankAdded);
    });

    it('should call addQuestionToBank and openErrorDialog with QuestionAlreadyInBank', fakeAsync(() => {
        const spy = new Subject<Question>();
        const mockQuestion = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };
        questionServiceSpy.addQuestionToBank.and.returnValue(spy);
        component.addToBank(mockQuestion);
        spy.error({ error: 'Question already exists' });
        tick();
        expect(questionServiceSpy.addQuestionToBank).toHaveBeenCalledWith(mockQuestion);
        expect(mockDialogAlertService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.QuestionAlreadyInBank);
    }));

    it('should call addQuestionToBank and openErrorDialog with AddQuestionToBank', fakeAsync(() => {
        const spy = new Subject<Question>();
        const mockQuestion = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };
        questionServiceSpy.addQuestionToBank.and.returnValue(spy);
        component.addToBank(mockQuestion);
        spy.error({ error: 'error' });
        tick();
        expect(questionServiceSpy.addQuestionToBank).toHaveBeenCalledWith(mockQuestion);
        expect(mockDialogAlertService.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.AddQuestionToBank);
    }));

    it('should call modifyQuestion', fakeAsync(() => {
        component.quizModified = {
            id: '',
            title: '',
            description: '',
            duration: 0,
            lastModification: new Date().toISOString(),
            questions: [],
        };
        component.modifyQuestion();
        tick();
        expect(mockMatDialog.open).toHaveBeenCalled();
    }));
});
