import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentChoices: Choice[] = [];
    score: number = 0;

    constructor(private http: HttpClient) {}

    postCurrentChoices(question: Question): Observable<boolean> {
        return this.http.post<boolean>(`${environment.serverUrl}/game/correct`, { choices: this.currentChoices, question });
    }
}
