import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQuestion, Question, TypeEnum } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import { McqHandlerService } from '@app/services/mcq-handler/mcq-handler.service';
import { OeqHandlerService } from '@app/services/oeq-handler/oeq-handler.service';
import { moveItem } from '@app/services/utils/utils';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    constructor(
        private http: HttpClient,
        private mcqQuestionHandler: McqHandlerService,
        private oeqQuestionHandler: OeqHandlerService,
    ) {}

    checkValidity(question: BaseQuestion): Observable<boolean> {
        return this.http.post<boolean>(`${environment.serverUrl}/quiz/valid/question`, question);
    }

    placeHigher(question: BaseQuestion, quiz: Quiz): void {
        const index = quiz.questions.indexOf(question);
        moveItem(quiz.questions, index, index - 1);
    }

    placeLower(question: BaseQuestion, quiz: Quiz): void {
        const index = quiz.questions.indexOf(question);
        moveItem(quiz.questions, index, index + 1);
    }

    deleteQuizQuestion(question: BaseQuestion, quiz: Quiz): void {
        quiz.questions = quiz.questions.filter((q) => q !== question);
    }

    addQuestionToBank(question: BaseQuestion): Observable<Question> {
        if (question.type === 'QCM') return this.mcqQuestionHandler.addMultipleChoiceQuestion(question);
        return this.oeqQuestionHandler.addOpenEndedQuestion(question);
    }

    // _id is a MongoDB property
    /* eslint-disable no-underscore-dangle */
    deleteQuestionFromBank(question: Question): Observable<void> {
        if (question.type === 'QCM') return this.mcqQuestionHandler.deleteMultipleChoiceQuestion(question._id);
        return this.oeqQuestionHandler.deleteOpenEndedQuestion(question._id);
    }

    updateQuestionInBank(question: Question): Observable<Question> {
        if (question.type === 'QCM') return this.mcqQuestionHandler.updateMultipleChoiceQuestion(question);
        return this.oeqQuestionHandler.updateOpenEndedQuestion(question);
    }
    /* eslint-enable no-underscore-dangle */

    getAllQuestions(): Observable<BaseQuestion[]> {
        return this.fetchAndSortAllQuestions().pipe(
            map((questions) =>
                questions.map((question) => ({
                    type: question.type,
                    text: question.text,
                    points: question.points,
                    choices: question.choices,
                })),
            ),
        );
    }

    getAllMultipleChoiceQuestions(): Observable<BaseQuestion[]> {
        return this.fetchAndSortMCQQuestions().pipe(
            map((questions) =>
                questions.map((question) => ({
                    type: question.type,
                    text: question.text,
                    points: question.points,
                    choices: question.choices,
                })),
            ),
        );
    }

    getAllQuestionsInformation(): Observable<Question[]> {
        return this.fetchAndSortAllQuestions();
    }

    getQuestionsByType(type: TypeEnum): Observable<Question[]> {
        switch (type) {
            case TypeEnum.QCM:
                return this.fetchAndSortMCQQuestions();
            case TypeEnum.QRL:
                return this.fetchAndSortOEQQuestions();
            case TypeEnum.ALL:
            default:
                return this.fetchAndSortAllQuestions();
        }
    }

    private fetchAndSortAllQuestions(): Observable<Question[]> {
        return this.fetchAllQuestions().pipe(map((questions) => this.sortQuestions(questions)));
    }

    private fetchAndSortOEQQuestions(): Observable<Question[]> {
        return this.fetchOEQQuestions().pipe(map((questions) => this.sortQuestions(questions)));
    }

    private fetchAndSortMCQQuestions(): Observable<Question[]> {
        return this.fetchMCQQuestions().pipe(map((questions) => this.sortQuestions(questions)));
    }

    private fetchAllQuestions(): Observable<Question[]> {
        return forkJoin({
            mcqQuestions: this.mcqQuestionHandler.getAllMultipleChoiceQuestions(),
            oeqQuestions: this.oeqQuestionHandler.getAllOpenEndedQuestions(),
        }).pipe(
            map(({ mcqQuestions, oeqQuestions }) => {
                return mcqQuestions.concat(oeqQuestions);
            }),
        );
    }

    private fetchOEQQuestions(): Observable<Question[]> {
        return this.oeqQuestionHandler.getAllOpenEndedQuestions();
    }

    private fetchMCQQuestions(): Observable<Question[]> {
        return this.mcqQuestionHandler.getAllMultipleChoiceQuestions();
    }

    private sortQuestions(questions: Question[]): Question[] {
        return questions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
