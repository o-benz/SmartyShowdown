import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseMultipleChoiceQuestion, MultipleChoiceQuestion } from '@app/interfaces/question-model';
import { Types } from 'mongoose';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminQuestionHandlerService {
    constructor(private http: HttpClient) {}

    getAllMultipleChoiceQuestions(): Observable<MultipleChoiceQuestion[]> {
        return this.http.get<MultipleChoiceQuestion[]>(`${environment.serverUrl}/question-mcq/`).pipe(
            map((response) =>
                response
                    // eslint-disable-next-line
                    .sort((a: MultipleChoiceQuestion, b: MultipleChoiceQuestion) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(
                        // eslint-disable-next-line
                        (item: any) =>
                            ({
                                ...item,
                                text: item.question,
                            }) as MultipleChoiceQuestion,
                    ),
            ),
        );
    }

    getMultipleChoiceQuestionById(id: Types.ObjectId): Observable<MultipleChoiceQuestion> {
        return this.http.get<MultipleChoiceQuestion>(`${environment.serverUrl}/question-mcq/${id}`);
    }

    addMultipleChoiceQuestion(question: BaseMultipleChoiceQuestion): Observable<MultipleChoiceQuestion> {
        return this.http.post<MultipleChoiceQuestion>(`${environment.serverUrl}/question-mcq/`, question);
    }

    deleteMultipleChoiceQuestion(id: Types.ObjectId): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/question-mcq/${id}`);
    }

    updateMultipleChoiceQuestion(question: MultipleChoiceQuestion): Observable<MultipleChoiceQuestion> {
        // eslint-disable-next-line no-underscore-dangle
        return this.http.patch<MultipleChoiceQuestion>(`${environment.serverUrl}/question-mcq/`, question);
    }

    getMultipleChoiceQuestionChoices(id: Types.ObjectId): Observable<string[]> {
        return this.http.get<string[]>(`${environment.serverUrl}/question-mcq/${id}/choices`);
    }

    getMultipleChoiceQuestionPoints(id: Types.ObjectId): Observable<number> {
        return this.http.get<number>(`${environment.serverUrl}/question-mcq/${id}/points`);
    }

    getMultipleChoiceQuestionType(id: Types.ObjectId): Observable<string> {
        return this.http.get<string>(`${environment.serverUrl}/question-mcq/${id}/type`);
    }

    getMultipleChoiceQuestionDate(id: Types.ObjectId): Observable<Date> {
        return this.http.get<Date>(`${environment.serverUrl}/question-mcq/${id}/date`);
    }
}
