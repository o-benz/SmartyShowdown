import { TestBed } from '@angular/core/testing';

import { AbstractControl, FormArray, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { BaseMultipleChoiceQuestion, Choice } from '@app/interfaces/question-model';
import { QuestionService } from '@app/services/question/question.service';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService', () => {
    let service: QuestionBankService;
    let fb: FormBuilder;
    let questionService: QuestionService;
    let dialogRef: MatDialogRef<NewQuestionFormComponent, unknown>;
    let choices: FormArray;
    let choice: Choice;
    let abstractControl: AbstractControl;
    let newQuestionFormComponent: NewQuestionFormComponent;
    let data: { baseQuestion: BaseMultipleChoiceQuestion };
    const MAX_CHOICES = 4;

    beforeEach(() => {
        fb = new FormBuilder();
        TestBed.configureTestingModule({
            providers: [
                QuestionBankService,
                { provide: FormBuilder, useValue: fb },
                { provide: FormArray, useValue: choices },
                { provide: AbstractControl, useValue: abstractControl },
                { provide: NewQuestionFormComponent, useValue: newQuestionFormComponent },
                { provide: MatDialogRef, useValue: dialogRef },
                { provide: QuestionService, useValue: questionService },
            ],
        });
        service = TestBed.inject(QuestionBankService);
        questionService = TestBed.inject(QuestionService);
        dialogRef = TestBed.inject(MatDialogRef);
        choices = fb.array([]);
        choice = generateMockChoice();
        abstractControl = fb.control('');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addMultipleChoice should add a multiple choice', () => {
        service.addMultipleChoice(choices, choice, MAX_CHOICES);
        expect(choices.length).toBe(1);
    });

    it('addMultipleChoice should not add multiple choice when maximum choices reached', () => {
        for (let i = 0; i < MAX_CHOICES; i++) {
            choices.push(fb.group(choice));
        }
        service.addMultipleChoice(choices, choice, MAX_CHOICES);
        expect(choices.value.length).toBe(MAX_CHOICES);
    });

    it('deleteMultipleChoice should delete multiple choice if in the form', () => {
        choices.push(fb.group(choice));
        service.deleteMultipleChoice(choices, choices.at(0).value);
        expect(choices.length).toBe(0);
    });

    it('deleteMultipleChoice should not delete multiple choice if not in the form', () => {
        choices.push(fb.group(choice));
        service.deleteMultipleChoice(choices, generateMockChoice());
        expect(choices.length).toBe(1);
    });

    it('placeChoiceHigher should swap the position of the choice with the previous one', () => {
        const firstChoice = generateMockChoice();
        const secondChoice = generateMockChoice();
        choices.push(fb.group(firstChoice));
        choices.push(fb.group(secondChoice));
        service.placeChoiceHigher(choices, choices.at(1).value);
        expect(choices.at(0).value).toEqual(secondChoice);
        expect(choices.at(1).value).toEqual(firstChoice);
    });

    it('placeChoiceHigher should not swap the position of the choice if it is the first one', () => {
        choices.push(fb.group(choice));
        choices.push(fb.group(generateMockChoice()));
        service.placeChoiceHigher(choices, choices.at(0).value);
        expect(choices.at(0).value).toEqual(choice);
    });

    it('placeChoiceLower should swap the position of the choice with the following one', () => {
        const secondChoice = generateMockChoice();
        choices.push(fb.group(choice));
        choices.push(fb.group(secondChoice));
        service.placeChoiceLower(choices, choices.at(0).value);
        expect(choices.at(0).value).toEqual(secondChoice);
        expect(choices.at(1).value).toEqual(choice);
    });

    it('placeChoiceLower should not swap the position of the choice if it is the last one', () => {
        const secondChoice = generateMockChoice();
        choices.push(fb.group(choice));
        choices.push(fb.group(secondChoice));
        service.placeChoiceLower(choices, choices.at(1).value);
        expect(choices.at(0).value).toEqual(choice);
        expect(choices.at(1).value).toEqual(secondChoice);
    });

    it('checkErrors should alert if control is required and not provided', () => {
        abstractControl.setValidators(Validators.required);
        spyOn(window, 'alert');
        abstractControl.setValue(null);
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test est nécessaire');
    });

    it('checkErrors should alert if control is less than min', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValidators(Validators.min(10));
        spyOn(window, 'alert');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValue(5);
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test doit être au moins 10');
    });

    it('checkErrors should alert if control is more than max', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValidators(Validators.max(100));
        spyOn(window, 'alert');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValue(110);
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test doit être au maximum 100');
    });

    it('checkErrors should alert if control is less than minlength', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValidators(Validators.minLength(2));
        spyOn(window, 'alert');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValue(new Array(1));
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test doit avoir au moins 2 choix');
    });

    it('checkErrors should alert if control is more than maxlength', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValidators(Validators.maxLength(4));
        spyOn(window, 'alert');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        abstractControl.setValue(new Array(5));
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test doit avoir au maximum 4 choix');
    });

    it('checkErrors should alert if control is not a multiple of 10', () => {
        const testComponent = new TestableNewQuestionFormComponent(fb, dialogRef, questionService, service, data);
        abstractControl.setValidators(testComponent.isMultipleOf10);
        abstractControl.setValue('value causing custom error');
        spyOn(window, 'alert');
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).toHaveBeenCalledWith('test doit être un multiple de 10');
    });

    it('checkErrors should not alert if control is valid', () => {
        spyOn(window, 'alert');
        abstractControl.setErrors(null);
        service.checkErrors(abstractControl, 'test');
        expect(window.alert).not.toHaveBeenCalled();
    });
});

const generateMockChoice = () => {
    return {
        text: getRandomString(),
        isCorrect: getRandomBoolean(),
    };
};
const BASE_36 = 36;
const BOOLEAN_PROBABILITY = 0.5;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomBoolean = (): boolean => Math.random() < BOOLEAN_PROBABILITY;

class TestableNewQuestionFormComponent extends NewQuestionFormComponent {
    isMultipleOf10(abstractControl: AbstractControl): ValidationErrors | null {
        const value = abstractControl.value;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (value % 10 !== 0) {
            return { notMultipleOf10: true };
        }
        return null;
    }
}
