import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { moveItem } from '@app/services/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ChoiceService {
    deleteMultipleChoice(choice: Choice, question: Question): void {
        if (question.choices) question.choices = question.choices.filter((c) => c !== choice);
    }

    placeHigher(choice: Choice, question: Question): void {
        if (!question.choices) return;
        const index = question.choices.indexOf(choice);
        moveItem(question.choices, index, index - 1);
    }

    placeLower(choice: Choice, question: Question): void {
        if (!question.choices) return;
        const index = question.choices.indexOf(choice);
        moveItem(question.choices, index, index + 1);
    }
}
