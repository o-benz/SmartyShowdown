import { TestBed } from '@angular/core/testing';

import { Choice, Question } from '@app/interfaces/quiz-model';
import { ChoiceService } from './choice.service';

describe('ChoiceService', () => {
    let service: ChoiceService;
    let question: Question;
    let mockChoices: Choice[];
    beforeEach(() => {
        mockChoices = [
            { text: 'choice 1', isCorrect: true },
            { text: 'choice 2', isCorrect: false },
            { text: 'choice 3', isCorrect: false },
        ];
        question = {
            type: 'QCM',
            text: 'question',
            points: 10,
            choices: mockChoices,
        };
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChoiceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should delete multiple choice', () => {
        if (question.choices) {
            service.deleteMultipleChoice(question.choices[1], question);
            expect(question.choices.length).toEqual(2);
        }
    });

    it('should place higher', () => {
        if (question.choices) {
            service.placeHigher(question.choices[1], question);
            expect(question.choices[0].text).toEqual('choice 2');
        }
    });

    it('should place lower', () => {
        if (question.choices) {
            service.placeLower(question.choices[1], question);
            expect(question.choices[1].text).toEqual('choice 3');
        }
    });

    it('should not place higher', () => {
        question.choices = undefined;
        if (!question.choices) {
            expect(question.choices).toEqual(undefined);
        }
    });

    it('should not place higher if choice is first', () => {
        if (question.choices) {
            service.placeHigher(question.choices[0], question);
            expect(question.choices[0].text).toEqual('choice 1');
        }
    });

    it('should not place lower if choice is last', () => {
        if (question.choices) {
            service.placeLower(question.choices[question.choices.length - 1], question);
            expect(question.choices[question.choices.length - 1].text).toEqual('choice 3');
        }
    });

    it('should not perform delete if choices are undefined', () => {
        question.choices = undefined;
        const choiceToDelete = { text: 'choice 1', isCorrect: true };
        service.deleteMultipleChoice(choiceToDelete, question);
        expect(question.choices).toBeUndefined();
    });

    it('should not move the first choice higher', () => {
        if (question.choices) {
            service.placeHigher(question.choices[0], question);
            expect(question.choices[0].text).toEqual('choice 1');
        }
    });

    it('should not move the last choice lower', () => {
        if (question.choices) {
            const lastChoiceIndex = question.choices.length - 1;
            service.placeLower(question.choices[lastChoiceIndex], question);
            expect(question.choices[lastChoiceIndex].text).toEqual('choice 3');
        }
    });

    it('should not do anything if choices are undefined in placeHigher', () => {
        question.choices = undefined;
        service.placeHigher(mockChoices[0], question);
        expect(question.choices).toBeUndefined();
    });

    it('should not do anything if choices are undefined in placeLower', () => {
        question.choices = undefined;
        service.placeLower(mockChoices[0], question);
        expect(question.choices).toBeUndefined();
    });
});
