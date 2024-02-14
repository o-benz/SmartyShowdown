import { Choice, Question } from '@app/model/quiz/quiz.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    async correctQuiz(choices: Choice[], question: Question): Promise<boolean> {
        if (question === undefined) return false;
        const correctChoices = question.choices ? question.choices.filter((choice) => choice.isCorrect === true) : [];
        if (correctChoices.length !== choices.length) {
            return false;
        }
        for (const correctChoice of correctChoices) {
            if (!choices.find((choice) => choice.text === correctChoice.text)) {
                return false;
            }
        }
        return true;
    }
}
