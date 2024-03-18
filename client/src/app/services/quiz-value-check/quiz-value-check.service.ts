import { Injectable } from '@angular/core';
import { Choice, Question, Quiz } from '@app/interfaces/quiz-model';
import quizmodelTI from '@app/interfaces/quiz-model-ti';
import { Range } from '@app/interfaces/range';
import { DURATION_RANGE, POINT_RANGE, QUESTION_RANGE } from '@app/services/constants';
import { QuizService } from '@app/services/quiz/quiz.service';
import { CheckerT, IErrorDetail, createCheckers } from 'ts-interface-checker';

@Injectable({
    providedIn: 'root',
})
export class QuizValueCheckService {
    _sanitizedQuiz: Quiz;
    errors: string = '';
    result: IErrorDetail[] | null;

    constructor(private quizService: QuizService) {}

    get sanitizedQuiz(): Quiz {
        return this._sanitizedQuiz; // eslint-disable-line no-underscore-dangle
    }

    isValidQuiz(): boolean {
        return this.result == null && this.errors === '';
    }

    getMessage(): string {
        if (this.result) {
            return this.resultToString(this.result);
        } else {
            return this.errors;
        }
    }

    checkQuiz(quiz: Quiz): void {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const checkers = createCheckers(quizmodelTI) as { Quiz: CheckerT<Quiz> }; // utilization suggested by library,
        this.result = checkers.Quiz.strictValidate(quiz); // see https://github.com/gristlabs/ts-interface-checker under the typeGuard section
        if (this.result == null) {
            this.errors = '';
            if (this.isNotInInterval(quiz.duration, DURATION_RANGE)) this.errors += "Erreur: la duree du quiz n'est pas dans l'intervale [10,60]\n";
            if (quiz.questions.length < 1) {
                this.errors += "Erreur: le quiz n'a pas de questions\n";
            } else {
                this.checkQuestions(quiz.questions);
            }
            this._sanitizedQuiz = this.prepareQuiz(quiz); // eslint-disable-line no-underscore-dangle
        }
    }

    private prepareQuiz(quiz: Quiz): Quiz {
        const now = new Date();
        quiz.id = this.quizService.generateRandomID(quiz.id.length);
        quiz.visible = false;
        quiz.lastModification = now.toISOString();
        return quiz;
    }

    private checkQuestions(questions: Question[]) {
        questions.forEach((question: Question, index: number) => {
            let questionError = '';
            if (this.isNotInInterval(question.points, POINT_RANGE))
                questionError += '    Erreur: les points doivent etre entre 10 et 100 en multiple de 10\n';
            if (question.type === 'QCM') {
                questionError += this.checkQCM(question);
            } else if (question.type === 'QRL') {
                if (question.choices) questionError += '    Erreur: une question à réponse longue ne peut pas avoir de choix\n';
            } else {
                questionError += '    Erreur: le type de question doit être QCM ou QRL\n';
            }
            if (questionError !== '') this.errors += 'a la question ' + index.toString() + '\n' + questionError;
        });
    }

    private checkQCM(question: Question): string {
        let errors = '';
        if (!question.choices || this.isNotInInterval(question.choices.length, QUESTION_RANGE)) {
            errors += '    Erreur: la question a choix multiple doit avoir de 2 à 4 choix\n';
        } else {
            if (!this.oneFalseAndTrueMinimum(question.choices)) {
                errors += '    Erreur: il doit y avoir au moins 1 mauvais et 1 bon choix\n';
            }
            question.choices.forEach((value) => {
                this.checkChoice(value);
            });
        }
        return errors;
    }

    private isNotInInterval(value: number, range: Range): boolean {
        return value < range.min || value > range.max || value % range.stride !== 0;
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
