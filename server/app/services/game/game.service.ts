import { Choice, Question } from '@app/model/quiz/quiz.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    constructor(private quizService: QuizService) {}

    async correctQuiz(choices: Choice[], questionText: string, quizId: string): Promise<boolean> {
        if (!questionText) return false;
        if (!quizId) return false;
        const currentQuestion: Question = await this.findQuestion(questionText, quizId);
        return this.findCorrectChoices(choices, currentQuestion);
    }

    findCorrectChoices(choices: Choice[], question: Question): boolean {
        const correctChoices = question.choices ? question.choices.filter((choice) => choice.isCorrect === true) : [];
        if (correctChoices.length !== choices.length) return false;
        for (const correctChoice of correctChoices) {
            if (!choices.find((choice) => choice.text === correctChoice.text)) {
                return false;
            }
        }
        return true;
    }
    async findQuestion(questionText: string, quizId: string): Promise<Question> {
        const currentQuiz = await this.quizService.getQuizById(quizId);
        return currentQuiz.questions.find((question) => question.text === questionText);
    }
}
