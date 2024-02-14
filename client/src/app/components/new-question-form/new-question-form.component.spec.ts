import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractControl, FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { BaseMultipleChoiceQuestion, Choice, MultipleChoiceQuestion, TypeEnum } from '@app/interfaces/question-model';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { QuestionService } from '@app/services/question/question.service';
import { Types } from 'mongoose';
import { of } from 'rxjs';
import { NewQuestionFormComponent } from './new-question-form.component';

describe('NewQuestionFormComponent', () => {
    let component: NewQuestionFormComponent;
    let fixture: ComponentFixture<NewQuestionFormComponent>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let mockQuestionBankService: jasmine.SpyObj<QuestionBankService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<NewQuestionFormComponent>>;
    let abstractControl: AbstractControl;
    let fb: FormBuilder;
    let choices: FormArray;
    let choice: Choice;
    const data = {};

    beforeEach(() => {
        mockQuestionService = jasmine.createSpyObj('NewQuestionFormComponent', ['checkValidity']);
        mockQuestionBankService = jasmine.createSpyObj('QuestionBankService', [
            'addMultipleChoice',
            'deleteMultipleChoice',
            'placeChoiceHigher',
            'placeChoiceLower',
            'checkErrors',
        ]);
        fb = new FormBuilder();
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'close', 'afterClosed']);
        mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close', 'afterClosed']);

        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [NewQuestionFormComponent, MatDialogActions],
            providers: [
                { provide: FormBuilder, useValue: fb },
                { provide: FormArray, useValue: choices },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: AbstractControl, useValue: abstractControl },
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: QuestionService, useValue: mockQuestionService },
                { provide: QuestionBankService, useValue: mockQuestionBankService },
                { provide: MatDialogActions, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NewQuestionFormComponent);
        component = fixture.componentInstance;
        abstractControl = fb.control('');
        choices = fb.array([]);
        choice = generateMockChoice();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should set questionForm properly ont init with mode create', () => {
        component.data = { baseQuestion: null };
        component.ngOnInit();
        expect(component.questionForm.value).toEqual({
            type: 'QCM',
            question: '',
            points: 10,
            choices: [],
        });
    });

    it('ngOnInit should set questionForm properly ont init with mode modify', () => {
        const question = generateMockQuestion(TypeEnum.QCM);
        component.data = { baseQuestion: question };
        component.ngOnInit();
        expect(component.questionForm.value).toEqual({
            type: question.type,
            question: question.text,
            points: question.points,
            choices: question.choices,
        });
    });

    it('onSubmit should close the dialog with the form value', () => {
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        const mockChoices = { text: getRandomString(), isCorrect: mockQuestion.choices[0].isCorrect === true ? false : true };
        mockQuestion.choices.push(mockChoices);
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            question: mockQuestion.text,
            points: 10,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(true));

        component.onSubmit();

        expect(mockMatDialogRef.close).toHaveBeenCalledWith(component.questionForm.value as BaseMultipleChoiceQuestion);
    });

    it('onSubmit should alert if Question is invalid', () => {
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        const mockChoices = { text: getRandomString(), isCorrect: mockQuestion.choices[0].isCorrect === true ? false : true };
        mockQuestion.choices.push(mockChoices);
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            question: mockQuestion.text,
            points: 10,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(false));
        const alertSpy = spyOn(window, 'alert');
        component.onSubmit();

        expect(alertSpy).toHaveBeenCalledWith('Formulaire invalide');
    });

    it('onSubmit should call checkErrors if form is invalid', () => {
        abstractControl.setValidators(Validators.required);
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            question: mockQuestion.text,
            points: mockQuestion.points,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(true));
        mockQuestionBankService.checkErrors(abstractControl, 'test');
        component.onSubmit();

        expect(mockQuestionBankService.checkErrors).toHaveBeenCalled();
    });

    it('cancel should close the dialog', () => {
        component.cancel();
        expect(mockMatDialogRef.close).toHaveBeenCalled();
    });

    it('addMultipleChoice should call addMultipleChoice from QuestionBankService', () => {
        component.addMultipleChoice(choice.text, (choice.isCorrect = true));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        mockQuestionBankService.addMultipleChoice(choices, choice, 4);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(mockQuestionBankService.addMultipleChoice).toHaveBeenCalledWith(choices, choice, 4);
    });

    it('deleteMultipleChoice should call deleteMultipleChoice from QuestionBankService', () => {
        component.deleteMultipleChoice(choice);
        mockQuestionBankService.deleteMultipleChoice(choices, choice);
        expect(mockQuestionBankService.deleteMultipleChoice).toHaveBeenCalledWith(choices, choice);
    });

    it('placeChoiceHigher should call placeChoiceHigher from QuestionBankService', () => {
        component.placeChoiceHigher(choice);
        mockQuestionBankService.placeChoiceHigher(choices, choice);
        expect(mockQuestionBankService.placeChoiceHigher).toHaveBeenCalledWith(choices, choice);
    });

    it('placeChoiceLower should call placeChoiceLower from QuestionBankService', () => {
        component.placeChoiceLower(choice);
        mockQuestionBankService.placeChoiceLower(choices, choice);
        expect(mockQuestionBankService.placeChoiceLower).toHaveBeenCalledWith(choices, choice);
    });

    it('isMultipleOf10 should return true when the control value is a multiple of 10', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const control = new FormControl(15);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).isMultipleOf10(control)).toEqual({ notMultipleOf10: true });
    });
});

const generateMockQuestion = (type: TypeEnum): MultipleChoiceQuestion => {
    return {
        type,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: new Types.ObjectId(),
        choices: [generateMockChoice()],
    };
};

const generateMockChoice = () => {
    return {
        text: getRandomString(),
        isCorrect: getRandomBoolean(),
    };
};
const BASE_36 = 36;
const BOOLEAN_PROBABILITY = 0.5;
const BASE_10 = 10;
const getRandomNumber = (): number => Math.floor(Math.random() * (BASE_10 + 1)) * BASE_10;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomBoolean = (): boolean => Math.random() < BOOLEAN_PROBABILITY;
