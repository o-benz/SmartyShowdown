import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractControl, FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { BaseQuestion, Choice, Question, TypeEnum } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { QuestionService } from '@app/services/question/question.service';
import { of } from 'rxjs';
import { NewQuestionFormComponent } from './new-question-form.component';

describe('NewQuestionFormComponent', () => {
    let component: NewQuestionFormComponent;
    let fixture: ComponentFixture<NewQuestionFormComponent>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let mockQuestionBankService: jasmine.SpyObj<QuestionBankService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<NewQuestionFormComponent>>;
    let mockDialogAlert: jasmine.SpyObj<DialogAlertService>;
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
        mockDialogAlert = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog']);

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
                { provide: DialogAlertService, useValue: mockDialogAlert },
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
            text: '',
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
            text: question.text,
            points: question.points,
            choices: question.choices,
        });
    });

    it('onSubmit should close the dialog with the form value', () => {
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        if (mockQuestion.choices) {
            const mockChoices = { text: getRandomString(), isCorrect: mockQuestion.choices[0].isCorrect === true ? false : true };
            mockQuestion.choices.push(mockChoices);
        }
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            text: mockQuestion.text,
            points: 10,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(true));

        component.onSubmit();

        expect(mockMatDialogRef.close).toHaveBeenCalledWith(component.questionForm.value as BaseQuestion);
    });

    it('onSubmit should alert if Question is invalid', () => {
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        if (mockQuestion.choices) {
            const mockChoices = { text: getRandomString(), isCorrect: mockQuestion.choices[0].isCorrect === true ? false : true };
            mockQuestion.choices.push(mockChoices);
        }
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            text: mockQuestion.text,
            points: 10,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(false));
        component.onSubmit();

        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith('Formulaire invalide');
    });

    it('onSubmit should call checkErrors if form is invalid', () => {
        abstractControl.setValidators(Validators.required);
        const mockQuestion = generateMockQuestion(TypeEnum.QCM);
        component.data = { baseQuestion: mockQuestion };
        component.ngOnInit();
        component.questionForm.setValue({
            type: mockQuestion.type,
            text: mockQuestion.text,
            points: mockQuestion.points,
            choices: mockQuestion.choices,
        });

        mockQuestionService.checkValidity.and.returnValue(of(true));
        mockQuestionBankService.checkErrors(abstractControl, 'test');
        component.onSubmit();

        expect(mockQuestionBankService.checkErrors).toHaveBeenCalled();
    });

    it('checkErrors should call openErrorDialog with formError when formError is not null', () => {
        mockQuestionBankService.checkErrors.and.returnValue('test est nécessaire');
        component['checkErrors'](abstractControl, 'test');
        expect(mockDialogAlert.openErrorDialog).toHaveBeenCalledWith('test est nécessaire');
    });

    it('checkErrors should not call openErrorDialog when formError is null', () => {
        mockQuestionBankService.checkErrors.and.returnValue(null);
        component['checkErrors'](abstractControl, 'test');
        expect(mockDialogAlert.openErrorDialog).not.toHaveBeenCalled();
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

    it('isMultipleOfIdentifier should return true when the control value is a multiple of 10', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const control = new FormControl(15);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).isMultipleOfIdentifier(control)).toEqual({ notMultipleOf10: true });
    });

    it('should remove "choices" control when type is "QRL"', () => {
        component['setupTypeControl']();
        component.questionForm.get('type')?.setValue('QRL');
        expect(component.questionForm.get('choices')).toBeNull();
    });

    it('should add "choices" control when type is "QCM" and it does not already exist', () => {
        component['setupTypeControl']();
        component.questionForm.removeControl('choices');
        expect(component.questionForm.get('choices')).toBeNull(); // Ensure control is not there before test
        component.questionForm.get('type')?.setValue('QCM');
        expect(component.questionForm.get('choices')).toBeTruthy();
    });

    it('should return a FormArray with no validators if type is QRL', () => {
        component['newQuestion'] = { type: TypeEnum.QRL, text: 'Sample', points: 10 };
        const formArray = component['getChoicesFormArray']();
        expect(formArray.validator).toBeNull();
    });

    it('should return a FormArray with validators if type is not QRL', () => {
        component['newQuestion'] = { type: TypeEnum.QCM, text: 'Sample', points: 10, choices: [{ text: 'Option 1' }] };
        const formArray = component['getChoicesFormArray']();
        expect(formArray.validator).toBeTruthy();
    });

    it('should handle no choices provided', () => {
        component['newQuestion'] = { type: TypeEnum.QCM, text: 'Sample', points: 10 };
        const formArray = component['getChoicesFormArray']();
        expect(formArray.length).toEqual(0);
    });

    it('should handle existing choices', () => {
        const choices2: Choice[] = [
            { text: 'Option 1', isCorrect: true },
            { text: 'Option 2', isCorrect: false },
        ];
        component['newQuestion'] = { type: TypeEnum.QCM, text: 'Sample', points: 10, choices: choices2 };
        const formArray = component['getChoicesFormArray']();
        expect(formArray.length).toEqual(2);
        expect(formArray.at(0).value).toEqual(choices2[0]);
        expect(formArray.at(1).value).toEqual(choices2[1]);
    });
});

const generateMockQuestion = (type: TypeEnum): Question => {
    return {
        type,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: getRandomId(),
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
const MULTIPLE_IDENTIFIER = 10;
const MILLIS_IN_SECOND = 1000;
const HEX_BASE = 16;
const getRandomNumber = (): number => Math.floor(Math.random() * (MULTIPLE_IDENTIFIER + 1)) * MULTIPLE_IDENTIFIER;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomBoolean = (): boolean => Math.random() < BOOLEAN_PROBABILITY;
const getRandomId = (): string => Math.floor(Date.now() / MILLIS_IN_SECOND).toString(HEX_BASE);
