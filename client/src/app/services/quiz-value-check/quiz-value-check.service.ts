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
    errors: string = '';
    sanitizedQuiz: Quiz;
    result: IErrorDetail[] | null;

    constructor(private quizService: QuizService) {}

    getResult(): boolean {
        return this.result == null && this.errors === '';
    }

    getMessage(): string {
        if (this.result == null) {
            return this.errors;
        } else {
            return this.resultToString(this.result);
        }
    }

    getSanitizedQuiz(): Quiz {
        return this.sanitizedQuiz;
    }

    checkQuiz(quiz: Quiz): void {
        // eslint-disable-next-line
        const checkers = createCheckers(quizmodelTI) as { Quiz: CheckerT<Quiz> };
        // eslint-disable-next-line
        this.result = checkers.Quiz.strictValidate(quiz);
        if (this.result == null) {
            this.checkQuizParamLimit(quiz);
            this.sanitizedQuiz = this.prepareQuiz(quiz);
        }
    }

    private prepareQuiz(quiz: Quiz): Quiz {
        const now = new Date();
        quiz.id = this.quizService.generateRandomID(quiz.id.length);
        quiz.visible = false;
        quiz.lastModification = now.toISOString();
        return quiz;
    }

    private checkQuizParamLimit(quiz: Quiz): void {
        this.errors = '';
        if (this.isNotInInterval(quiz.duration, DURATION_RANGE)) this.errors += "Erreur: la duree du quiz n'est pas dans l'intervale [10,60]\n";
        if (quiz.questions.length < 1) {
            this.errors += "Erreur: le quiz n'a pas de questions\n";
        } else {
            quiz.questions.forEach((value: Question, index: number) => {
                const questionError = this.checkQuestion(value);
                if (questionError !== '') {
                    this.errors += 'a la question ' + index.toString() + '\n' + questionError;
                }
            });
        }
    }

    private checkQuestion(question: Question): string {
        let errors = '';
        if (this.isNotInInterval(question.points, POINT_RANGE)) errors += '    Erreur: les points doivent etre entre 10 et 100 en multiple de 10\n';

        if (question.type === 'QCM') {
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
        } else if (question.type === 'QRL') {
            if (question.choices) errors += '    Erreur: une question à réponse longue ne peut pas avoir de choix\n';
        } else {
            errors += '    Erreur: le type de question doit être QCM ou QRL\n';
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
                fullMessage += value.nested
                    ? this.resultToString(value.nested)
                    : value.path + ' ' + value.message.replace('is missing', 'est manquant').replace('is not a', "n'est pas de type") + ',\n';
            });
        return fullMessage;
    }
}
