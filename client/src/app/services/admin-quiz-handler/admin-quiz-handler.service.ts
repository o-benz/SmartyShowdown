import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz-model';
import * as exporter from 'export-from-json';
import { IOption } from 'export-from-json/dist/types/exportFromJSON'; //eslint-disable-line 
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminQuizHandler {
    constructor(private http: HttpClient) {}

    export(quiz: Quiz): void {
        const data = quiz;
        const fileName = quiz.title;
        const exportType = 'json';

        this.libraryCaller({ data, fileName, exportType });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.serverUrl}/quiz/${id}`);
    }

    toggleQuizVisibility(id: string): Observable<Quiz> {
        return this.http.put<Quiz>(`${environment.serverUrl}/quiz/${id}`, {});
    }

    private libraryCaller(args: IOption) {
        exporter.default(args);
    }
}
