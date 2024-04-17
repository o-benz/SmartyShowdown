import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQuestion, Question } from '@app/interfaces/question-model';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class McqHandlerService {
    constructor(private http: HttpClient) {}

    getAllMultipleChoiceQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(`${environment.serverUrl}/question-mcq/`).pipe(
            map((response: Question[]) => {
                return response.sort((a: Question, b: Question) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }),
        );
    }

    getMultipleChoiceQuestionById(id: string): Observable<Question> {
        return this.http.get<Question>(`${environment.serverUrl}/question-mcq/${id}`);
    }

    addMultipleChoiceQuestion(question: BaseQuestion): Observable<Question> {
        return this.http.post<Question>(`${environment.serverUrl}/question-mcq/`, {
            type: question.type,
            text: question.text,
            points: question.points,
            choices: question.choices,
        });
    }

    deleteMultipleChoiceQuestion(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/question-mcq/${id}`);
    }

    updateMultipleChoiceQuestion(question: Question): Observable<Question> {
        return this.http.patch<Question>(`${environment.serverUrl}/question-mcq/`, {
            type: question.type,
            text: question.text,
            points: question.points,
            choices: question.choices,
            // _id is a MongoDB property
            // eslint-disable-next-line no-underscore-dangle
            _id: question._id,
        });
    }

    getMultipleChoiceQuestionChoices(id: string): Observable<string[]> {
        return this.http.get<string[]>(`${environment.serverUrl}/question-mcq/${id}/choices`);
    }

    getMultipleChoiceQuestionPoints(id: string): Observable<number> {
        return this.http.get<number>(`${environment.serverUrl}/question-mcq/${id}/points`);
    }

    getMultipleChoiceQuestionType(id: string): Observable<string> {
        return this.http.get<string>(`${environment.serverUrl}/question-mcq/${id}/type`);
    }

    getMultipleChoiceQuestionDate(id: string): Observable<Date> {
        return this.http.get<Date>(`${environment.serverUrl}/question-mcq/${id}/date`);
    }
}
