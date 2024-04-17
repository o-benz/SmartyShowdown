import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { Choice, Question, TypeEnum } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { of, throwError } from 'rxjs';
import { QuestionListComponent } from './question-list.component';

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockDialogAlert: jasmine.SpyObj<DialogAlertService>;
    const dialogWidth = '50%';

    beforeEach(() => {
        mockQuestionService = jasmine.createSpyObj('QuestionService', [
            'getAllQuestionsInformation',
            'addQuestionToBank',
            'deleteQuestionFromBank',
            'updateQuestionInBank',
            'getMCQQuestionsInformation',
            'getOEQQuestionsInformation',
            'getQuestionsByType',
        ]);

        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed'], ['confirm']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockDialogAlert = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog', 'openSuccessDialog']);

        TestBed.configureTestingModule({
            declarations: [QuestionListComponent],
            providers: [
                { provide: QuestionService, useValue: mockQuestionService },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DialogAlertService, useValue: mockDialogAlert },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
        mockQuestionService.getAllQuestionsInformation.and.returnValue(of([]));
        mockQuestionService.getQuestionsByType.and.returnValue(of([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call unsubscribe on the subscription when component is destroyed', () => {
        const questionsSubscriptionSpy = spyOn(component['questionsSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(questionsSubscriptionSpy).toHaveBeenCalled();
    });

    it('should fetch all multiple choice questions on init', () => {
        expect(mockQuestionService.getAllQuestionsInformation).toHaveBeenCalled();
    });

    it('should assign fetched questions to QuestionListComponent.questions', () => {
        const mockQuestions = [getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM)];
        mockQuestionService.getAllQuestionsInformation.and.returnValue(of(mockQuestions as Question[]));
        component.ngOnInit();
        expect(QuestionListComponent.questions).toEqual(mockQuestions as Question[]);
    });

    it('deleteQuestion should open a window to delete a question', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockQuestionService.deleteQuestionFromBank.and.returnValue(of(undefined));
        const question = getMockQuestion(TypeEnum.QCM);
        component.deleteQuestion(question);
        expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette question ?');
    });

    it('deleteQuestion should delete question when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockQuestionService.deleteQuestionFromBank.and.returnValue(of(undefined));
        const question = getMockQuestion(TypeEnum.QCM);
        component.deleteQuestion(question);
        expect(mockQuestionService.deleteQuestionFromBank).toHaveBeenCalledWith(question);
    });

    it('deleteQuestion should remove question from list when delete is successful', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const question = getMockQuestion(TypeEnum.QCM);
        QuestionListComponent.questions = [getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM)];
        // eslint-disable-next-line no-underscore-dangle
        QuestionListComponent.questions[0]._id = question._id;
        const deletedQuestions = QuestionListComponent.questions[0];
        mockQuestionService.deleteQuestionFromBank.and.returnValue(of(undefined));
        component.deleteQuestion(question);
        // eslint-disable-next-line no-underscore-dangle
        expect(mockQuestionService.deleteQuestionFromBank).toHaveBeenCalled();
        expect(QuestionListComponent.questions).not.toContain(deletedQuestions);
    });

    it('deleteQuestion should send error message when delete fails', () => {
        const question = getMockQuestion(TypeEnum.QCM);
        const mockErrorMessage = 'Erreur lors de la suppression de la question. Veuillez réessayer.';

        spyOn(window, 'confirm').and.returnValue(true);
        mockQuestionService.deleteQuestionFromBank.and.returnValue(throwError(() => new Error('error')));
        component.deleteQuestion(question);

        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(mockErrorMessage);
    });

    it('deleteQuestion should not delete question when not confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const question = getMockQuestion(TypeEnum.QCM);
        component.deleteQuestion(question);
        expect(mockQuestionService.deleteQuestionFromBank).not.toHaveBeenCalled();
    });

    it('modifyQuestion should open a dialog window to modify a question', () => {
        const questionId = getRandomId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        mockQuestionService.updateQuestionInBank.and.returnValue(of(mockQuestion as Question));
        component.modifyQuestion(questionId);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('modifyQuestion should open the dialog with the correct data', () => {
        QuestionListComponent.questions = [getMockQuestion(TypeEnum.QCM)];
        // eslint-disable-next-line no-underscore-dangle
        const questionId = QuestionListComponent.questions[0]._id;
        component.modifyQuestion(questionId);
        expect(mockMatDialog.open).toHaveBeenCalledWith(NewQuestionFormComponent, {
            data: { baseQuestion: QuestionListComponent.questions[0] },
            width: dialogWidth,
            disableClose: true,
        });
    });

    it('modifyQuestion should update the question when the dialog is closed', () => {
        const questionId = getRandomId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.updateQuestionInBank.and.returnValue(of(mockQuestion as Question));
        component.modifyQuestion(questionId);
        expect(mockQuestionService.updateQuestionInBank).toHaveBeenCalledWith({
            ...(mockQuestion as Question),
            _id: questionId,
        });
    });

    it('modifyQuestion should send error message when update fails', () => {
        const questionId = getRandomId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.updateQuestionInBank.and.returnValue(throwError(() => new Error('Error message')));
        component.modifyQuestion(questionId);
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.UpdateQuestionError);
    });

    it('modifyQuestion should not do anything if question type is not QCM or QRL', () => {
        const questionId = getRandomId();
        const mockQuestion = getMockQuestion('test' as TypeEnum);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.updateQuestionInBank.and.returnValue(of(mockQuestion as Question));
        component.modifyQuestion(questionId);
        expect(mockQuestionService.updateQuestionInBank).not.toHaveBeenCalled();
    });

    it('addQuestion should open a dialog with the correct data', () => {
        component.createQuestion();
        expect(mockMatDialog.open).toHaveBeenCalledWith(NewQuestionFormComponent, {
            data: { baseQuestion: null },
            width: dialogWidth,
            disableClose: true,
        });
    });

    it('addQuestion should add a question when the dialog is closed', () => {
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.addQuestionToBank.and.returnValue(of(mockQuestion as Question));
        component.createQuestion();
        expect(mockQuestionService.addQuestionToBank).toHaveBeenCalledWith({
            ...(mockQuestion as Question),
        });
    });

    it('addQuestion should send error message when adding fails', () => {
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.addQuestionToBank.and.returnValue(throwError(() => new Error('Error message')));
        component.createQuestion();
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.AddQuestionToBank);
    });

    it('addQuestion should send error message when question already exists', () => {
        const mockError = { error: 'Question already exists' };
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.addQuestionToBank.and.returnValue(throwError(() => mockError));
        component.createQuestion();
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.QuestionAlreadyInBank);
    });

    it('addQuestion should not do anything if question type is not QCM or QRL', () => {
        const mockQuestion = getMockQuestion('test' as TypeEnum);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockQuestionService.addQuestionToBank.and.returnValue(of(mockQuestion as Question));
        component.createQuestion();
        expect(mockQuestionService.addQuestionToBank).not.toHaveBeenCalled();
    });

    it('setFilterState should update the filter state', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'updateQuestionsList');

        component['setFilterState'](TypeEnum.QCM);

        expect(component['filterState']).toEqual(TypeEnum.QCM);
        expect(component['updateQuestionsList']).toHaveBeenCalled();
    });

    it('updateQuestion should call openErrorDialog on error', () => {
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockId = getRandomId();
        const mockError = new Error('error');
        mockQuestionService.updateQuestionInBank.and.returnValue(throwError(() => mockError));
        component['updateQuestion'](mockQuestion, mockId);
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.UpdateQuestionError);
    });

    it('updateQuestion should call Question already exists error message', () => {
        const mockError = { error: 'Question already exists' };
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockId = getRandomId();
        mockQuestionService.updateQuestionInBank.and.returnValue(throwError(() => mockError));
        component['updateQuestion'](mockQuestion, mockId);
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith(ErrorMessages.QuestionAlreadyInBank);
    });
});

const getMockQuestion = (type: TypeEnum): Question => {
    return {
        type,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: getRandomId(),
        choices: generateChoices(1),
    };
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const PROBABILITY = 0.5;
const MILLIS_IN_SECOND = 1000;
const HEX_BASE = 16;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
const getRandomId = (): string => Math.floor(Date.now() / MILLIS_IN_SECOND).toString(HEX_BASE);
const getRandomChoice = (): Choice => ({
    text: getRandomString(),
    isCorrect: Math.random() > PROBABILITY,
});
const generateChoices = (n: number): Choice[] => {
    const choices = [];
    for (let i = 0; i < n; i++) {
        choices.push(getRandomChoice());
    }
    return choices;
};
