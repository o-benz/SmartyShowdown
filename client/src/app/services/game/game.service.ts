import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice } from '@app/interfaces/quiz-model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentChoices: Choice[] = [];
    score: number = 0;
    quizId: string;
    isChoiceFinal: boolean = false;

    constructor(private http: HttpClient) {}

    static staysInInterval(last: number, value: number, first: number = 0): boolean {
        return value >= first && value <= last;
    }

    postCurrentChoices(questionText: string): Observable<boolean> {
        this.isChoiceFinal = true;
        return this.http.post<boolean>(`${environment.serverUrl}/game/correct`, {
            clientAnswers: this.currentChoices,
            questionText,
            quizId: this.quizId,
        });
    }
}
