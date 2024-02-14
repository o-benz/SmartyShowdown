import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice, Question, Quiz, QuizComponentEnum } from '@app/interfaces/quiz-model';
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
        if (index > 0) {
            [quiz.questions[index - 1], quiz.questions[index]] = [quiz.questions[index], quiz.questions[index - 1]];
        }
    }

    placeLower(question: Question, quiz: Quiz): void {
        const index = quiz.questions.indexOf(question);
        if (index < quiz.questions.length - 1) {
            [quiz.questions[index + 1], quiz.questions[index]] = [quiz.questions[index], quiz.questions[index + 1]];
        }
    }

    deleteQuestion(question: Question, quiz: Quiz): void {
        quiz.questions = quiz.questions.filter((q) => q !== question);
    }

    addQuestionToBank(qcm: Question): Observable<unknown> {
        // eslint-disable-next-line
        return this.http.post<any>(`${environment.serverUrl}/question-mcq/`, {
            type: qcm.type,
            question: qcm.text,
            points: qcm.points,
            choices: qcm.choices,
        });
    }

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<unknown[]>(`${environment.serverUrl}/question-mcq/`).pipe(
            map((response) =>
                response
                    // eslint-disable-next-line
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(
                        // eslint-disable-next-line
                        (item: any) =>
                            ({
                                type: item.type,
                                text: item.question,
                                points: item.points,
                                choices: item.choices,
                            }) as Question,
                    ),
            ),
        );
    }
}
