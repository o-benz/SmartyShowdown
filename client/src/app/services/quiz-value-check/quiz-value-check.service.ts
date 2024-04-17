import { Injectable } from '@angular/core';
import { BaseQuestion, Choice } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import quizmodelTI from '@app/interfaces/quiz-model-ti';
import { Range } from '@app/interfaces/range';
import { DURATION_RANGE, POINT_RANGE, QUESTION_RANGE } from '@app/services/constants';
import { QuizService } from '@app/services/quiz/quiz.service';
import { CheckerT, IErrorDetail, createCheckers } from 'ts-interface-checker';

@Injectable({
    providedIn: 'root',
})
export class QuizValueCheckService {
    errors: string = '';
    result: IErrorDetail[] | null;
    private sanitizedQuizValue: Quiz;

    constructor(private quizService: QuizService) {}

    get sanitizedQuiz(): Quiz {
        return this.sanitizedQuizValue;
    }

    isValidQuiz(): boolean {
        return this.result == null && this.errors === '';
    }

    getMessage(): string {
        return this.result ? this.resultToString(this.result) : this.errors;
    }

    checkQuiz(quiz: Quiz): void {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const checkers = createCheckers(quizmodelTI) as { Quiz: CheckerT<Quiz> }; // utilization suggested by library,
        this.result = checkers.Quiz.strictValidate(quiz); // see https://github.com/gristlabs/ts-interface-checker under the typeGuard section
        if (this.result !== null) {
            return;
        }

        const errors = [];
        if (!this.isInInterval(quiz.duration, DURATION_RANGE)) {
            errors.push("Erreur: la duree du quiz n'est pas dans l'intervale [10,60]");
        }
        if (!Array.isArray(quiz.questions) || quiz.questions.length < 1) {
            errors.push("Erreur: le quiz n'a pas de questions");
        } else {
            this.checkQuestions(quiz.questions);
        }
        this.errors = errors.join('\n');
        if (this.errors === '') {
            this.sanitizedQuizValue = this.prepareQuiz(quiz);
        }
    }

    private prepareQuiz(quiz: Quiz): Quiz {
        const now = new Date();
        quiz.id = this.quizService.generateRandomID(quiz.id.length);
        quiz.visible = false;
        quiz.lastModification = now.toISOString();
        return quiz;
    }

    private checkQuestions(questions: BaseQuestion[]) {
        questions.forEach((question: BaseQuestion, index: number) => {
            let questionError = '';
            if (!this.isInInterval(question.points, POINT_RANGE))
                questionError += '    Erreur: les points doivent etre entre 10 et 100 en multiple de 10\n';
            if (question.type === 'QCM') {
                questionError += this.checkQCM(question);
            } else if (question.type === 'QRL' && question.choices) {
                if (question.choices.length > 0) questionError += '    Erreur: une question à réponse longue ne peut pas avoir de choix\n';
            } else if (question.type !== 'QCM' && question.type !== 'QRL') {
                questionError += '    Erreur: le type de question doit être QCM ou QRL\n';
            }
            if (questionError !== '') this.errors += 'a la question ' + index.toString() + '\n' + questionError;
        });
    }

    private checkQCM(question: BaseQuestion): string {
        let errors = '';
        if (question.choices && this.isInInterval(question.choices.length, QUESTION_RANGE)) {
            if (!this.oneFalseAndTrueMinimum(question.choices)) {
                errors += '    Erreur: il doit y avoir au moins 1 mauvais et 1 bon choix\n';
            }
            question.choices.forEach((value) => {
                this.checkChoice(value);
            });
        } else {
            errors += '    Erreur: la question a choix multiple doit avoir de 2 à 4 choix\n';
        }
        return errors;
    }

    private isInInterval(value: number, range: Range): boolean {
        return value >= range.min && value <= range.max && value % range.stride === 0;
    }

    private oneFalseAndTrueMinimum(choices: Choice[]): boolean {
        return choices.some((value) => value.isCorrect) && choices.some((value) => !value.isCorrect);
    }

    private checkChoice(choice: Choice): void {
        if (!choice.isCorrect) {
            choice.isCorrect = false;
        }
    }

    private resultToString(errors: IErrorDetail[] | undefined): string {
        let fullMessage = '';
        if (errors)
            errors.forEach((value) => {
                fullMessage += this.resultToString(value.nested) + this.translateError(value);
            });
        return fullMessage;
    }

    private translateError(error: IErrorDetail): string {
        return error.path + ' ' + error.message.replace('is missing', 'est manquant').replace('is not a', "n'est pas de type") + ',\n';
    }
}
