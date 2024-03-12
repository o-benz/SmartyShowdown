import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { MultipleChoiceQuestion, QuestionModel, TypeEnum } from '@app/interfaces/question-model';
import { Choice } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { AdminQuestionHandlerService } from '@app/services/mcq-handler/mcq-handler.service';
import { Types } from 'mongoose';
import { QuestionListComponent } from './question-list.component';

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let mockAdminQuestionHandlerService: jasmine.SpyObj<AdminQuestionHandlerService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockDialogError: jasmine.SpyObj<DialogErrorService>;
    const dialogWidth = '50%';

    beforeEach(() => {
        mockAdminQuestionHandlerService = jasmine.createSpyObj('AdminQuestionHandlerService', [
            'deleteMultipleChoiceQuestion',
            'getAllMultipleChoiceQuestions',
            'updateMultipleChoiceQuestion',
            'addMultipleChoiceQuestion',
        ]);

        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed'], ['confirm']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockDialogError = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog']);

        TestBed.configureTestingModule({
            declarations: [QuestionListComponent],
            providers: [
                { provide: AdminQuestionHandlerService, useValue: mockAdminQuestionHandlerService },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DialogErrorService, useValue: mockDialogError },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
        mockAdminQuestionHandlerService.getAllMultipleChoiceQuestions.and.returnValue(of([]));
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
        expect(mockAdminQuestionHandlerService.getAllMultipleChoiceQuestions).toHaveBeenCalled();
    });

    it('should assign fetched questions to QuestionListComponent.questions', () => {
        const mockQuestions = [getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM)];
        mockAdminQuestionHandlerService.getAllMultipleChoiceQuestions.and.returnValue(of(mockQuestions as MultipleChoiceQuestion[]));
        component.ngOnInit();
        expect(QuestionListComponent.questions).toEqual(mockQuestions as QuestionModel[]);
    });

    it('deleteQuestion should open a window to delete a question', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion.and.returnValue(of(undefined));
        const questionId = new Types.ObjectId();
        component.deleteQuestion(questionId);
        expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette question ?');
    });

    it('deleteQuestion should delete question when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion.and.returnValue(of(undefined));
        const questionId = new Types.ObjectId();
        component.deleteQuestion(questionId);
        expect(mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion).toHaveBeenCalledWith(questionId);
    });

    it('deleteQuestion should remove question from list when delete is successful', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const id = new Types.ObjectId();
        QuestionListComponent.questions = [getMockQuestion(TypeEnum.QCM), getMockQuestion(TypeEnum.QCM)];
        // eslint-disable-next-line no-underscore-dangle
        QuestionListComponent.questions[0]._id = id;
        const deletedQuestions = QuestionListComponent.questions[0];
        mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion.and.returnValue(of(undefined));
        component.deleteQuestion(id);
        // eslint-disable-next-line no-underscore-dangle
        expect(mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion).toHaveBeenCalled();
        expect(QuestionListComponent.questions).not.toContain(deletedQuestions);
    });

    it('deleteQuestion should send error message when delete fails', () => {
        const mockId = new Types.ObjectId();
        const mockErrorMessage = 'Erreur lors de la suppression de la question. Veuillez réessayer.';

        spyOn(window, 'confirm').and.returnValue(true);
        mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion.and.returnValue(throwError(() => new Error('error')));
        component.deleteQuestion(mockId);

        expect(mockDialogError.openErrorDialog).toHaveBeenCalledWith(mockErrorMessage); // Change access modifier to public
    });

    it('deleteQuestion should not delete question when not confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const questionId = new Types.ObjectId();
        component.deleteQuestion(questionId);
        expect(mockAdminQuestionHandlerService.deleteMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it('modifyQuestion should open a dialog window to modify a question', () => {
        const questionId = new Types.ObjectId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        mockAdminQuestionHandlerService.updateMultipleChoiceQuestion.and.returnValue(of(mockQuestion as MultipleChoiceQuestion));
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
        const questionId = new Types.ObjectId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockAdminQuestionHandlerService.updateMultipleChoiceQuestion.and.returnValue(of(mockQuestion as MultipleChoiceQuestion));
        component.modifyQuestion(questionId);
        expect(mockAdminQuestionHandlerService.updateMultipleChoiceQuestion).toHaveBeenCalledWith({
            ...(mockQuestion as MultipleChoiceQuestion),
            _id: questionId,
        });
    });

    it('modifyQuestion should send error message when update fails', () => {
        const questionId = new Types.ObjectId();
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockAdminQuestionHandlerService.updateMultipleChoiceQuestion.and.returnValue(throwError(() => new Error('Error message')));
        component.modifyQuestion(questionId);
        expect(mockDialogError.openErrorDialog).toHaveBeenCalledWith('Erreur lors de la modification de la question. Veuillez réessayer.');
    });

    it('modifyQuestion should not do anything if question type is not QCM', () => {
        const questionId = new Types.ObjectId();
        const mockQuestion = getMockQuestion(TypeEnum.QRL);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockAdminQuestionHandlerService.updateMultipleChoiceQuestion.and.returnValue(of(mockQuestion as MultipleChoiceQuestion));
        component.modifyQuestion(questionId);
        expect(mockAdminQuestionHandlerService.updateMultipleChoiceQuestion).not.toHaveBeenCalled();
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
        mockAdminQuestionHandlerService.addMultipleChoiceQuestion.and.returnValue(of(mockQuestion as MultipleChoiceQuestion));
        component.createQuestion();
        expect(mockAdminQuestionHandlerService.addMultipleChoiceQuestion).toHaveBeenCalledWith({
            ...(mockQuestion as MultipleChoiceQuestion),
        });
    });

    it('addQuestion should send error message when adding fails', () => {
        const mockQuestion = getMockQuestion(TypeEnum.QCM);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockAdminQuestionHandlerService.addMultipleChoiceQuestion.and.returnValue(throwError(() => new Error('Error message')));
        component.createQuestion();
        expect(mockDialogError.openErrorDialog).toHaveBeenCalledWith("Erreur lors de l'ajout de la question. Veuillez réessayer.");
    });

    it('addQuestion should not do anything if question type is not QCM', () => {
        const mockQuestion = getMockQuestion(TypeEnum.QRL);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(mockQuestion));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockAdminQuestionHandlerService.addMultipleChoiceQuestion.and.returnValue(of(mockQuestion as MultipleChoiceQuestion));
        component.createQuestion();
        expect(mockAdminQuestionHandlerService.addMultipleChoiceQuestion).not.toHaveBeenCalled();
    });
});

const getMockQuestion = (type: TypeEnum): QuestionModel => {
    return {
        type,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: new Types.ObjectId(),
        choices: generateChoices(1),
    };
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const PROBABILITY = 0.5;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
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
