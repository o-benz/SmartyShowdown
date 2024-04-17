import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQuestion, Question } from '@app/interfaces/question-model';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class OeqHandlerService {
    constructor(private http: HttpClient) {}

    getAllOpenEndedQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(`${environment.serverUrl}/question-oeq/`).pipe(
            map((response: Question[]) => {
                return response.sort((a: Question, b: Question) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }),
        );
    }

    getOpenEndedQuestionById(id: string): Observable<Question> {
        return this.http.get<Question>(`${environment.serverUrl}/question-oeq/${id}`);
    }

    addOpenEndedQuestion(question: BaseQuestion): Observable<Question> {
        return this.http.post<Question>(`${environment.serverUrl}/question-oeq/`, {
            type: question.type,
            text: question.text,
            points: question.points,
        });
    }

    deleteOpenEndedQuestion(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/question-oeq/${id}`);
    }

    updateOpenEndedQuestion(question: Question): Observable<Question> {
        return this.http.patch<Question>(`${environment.serverUrl}/question-oeq/`, {
            type: question.type,
            text: question.text,
            points: question.points,
            // _id is a MongoDB property
            // eslint-disable-next-line no-underscore-dangle
            _id: question._id,
        });
    }

    getOpenEndedQuestionPoints(id: string): Observable<number> {
        return this.http.get<number>(`${environment.serverUrl}/question-oeq/${id}/points`);
    }

    getOpenEndedQuestionType(id: string): Observable<string> {
        return this.http.get<string>(`${environment.serverUrl}/question-oeq/${id}/type`);
    }

    getOpenEndedQuestionDate(id: string): Observable<Date> {
        return this.http.get<Date>(`${environment.serverUrl}/question-oeq/${id}/date`);
    }
}
