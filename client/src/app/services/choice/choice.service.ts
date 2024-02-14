import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';

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
        if (index > 0) {
            [question.choices[index - 1], question.choices[index]] = [question.choices[index], question.choices[index - 1]];
        }
    }

    placeLower(choice: Choice, question: Question): void {
        if (!question.choices) return;
        const index = question.choices.indexOf(choice);
        if (index < question.choices.length - 1) {
            [question.choices[index + 1], question.choices[index]] = [question.choices[index], question.choices[index + 1]];
        }
    }
}
