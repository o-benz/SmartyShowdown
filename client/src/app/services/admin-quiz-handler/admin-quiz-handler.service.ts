import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz-model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminQuizHandler {
    constructor(private http: HttpClient) {}

    export(quiz: Quiz): string {
        const dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz));
        return dataUri;
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/quiz/${id}`);
    }

    toggleQuizVisibility(id: string): Observable<Quiz> {
        return this.http.put<Quiz>(`${environment.serverUrl}/quiz/${id}`, {});
    }
}
