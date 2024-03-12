import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice, MultipleChoiceQuestion, Question, Quiz, QuizComponentEnum } from '@app/interfaces/quiz-model';
import { moveItem } from '@app/services/utils/utils';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    constructor(private http: HttpClient) {}

    checkValidity(question: Question): Observable<boolean> {
        return this.http.post<boolean>(`${environment.serverUrl}/quiz/valid/question`, question);
    }

    addMultipleChoice(choice: Choice, question: Question): void {
        if (choice.text !== '' && question && (question.choices?.length ?? 0) < QuizComponentEnum.MAXCHOICES) question.choices?.push(choice);
    }

    placeHigher(question: Question, quiz: Quiz): void {
        const index = quiz.questions.indexOf(question);
        moveItem(quiz.questions, index, index - 1);
    }

    placeLower(question: Question, quiz: Quiz): void {
        const index = quiz.questions.indexOf(question);
        moveItem(quiz.questions, index, index + 1);
    }

    deleteQuestion(question: Question, quiz: Quiz): void {
        quiz.questions = quiz.questions.filter((q) => q !== question);
    }

    addQuestionToBank(qcm: Question): Observable<unknown> {
        return this.http.post<unknown>(`${environment.serverUrl}/question-mcq/`, {
            type: qcm.type,
            question: qcm.text,
            points: qcm.points,
            choices: qcm.choices,
        });
    }

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<MultipleChoiceQuestion[]>(`${environment.serverUrl}/question-mcq/`).pipe(
            map((response) =>
                response
                    .sort((a: MultipleChoiceQuestion, b: MultipleChoiceQuestion) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item: MultipleChoiceQuestion) => ({
                        type: item.type,
                        text: item.question,
                        points: item.points,
                        choices: item.choices,
                    })),
            ),
        );
    }
}
