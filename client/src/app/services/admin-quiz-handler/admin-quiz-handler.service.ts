import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz-model';
// eslint-disable-next-line
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminQuizHandler {
    constructor(private http: HttpClient) {}

    export(quiz: Quiz): void {
        const downloader = document.createElement('a');
        downloader.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz));
        downloader.download = quiz.title + '.json';
        downloader.click();
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/quiz/${id}`);
    }

    toggleQuizVisibility(id: string): Observable<Quiz> {
        return this.http.put<Quiz>(`${environment.serverUrl}/quiz/${id}`, {});
    }
}
