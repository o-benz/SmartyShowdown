import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
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

    constructor(
        private http: HttpClient,
        private socketService: SocketCommunicationService,
    ) {}

    staysInInterval(last: number, value: number, first: number = 0): boolean {
        return first <= value && value < last;
    }

    postCurrentChoices(questionText: string): Observable<boolean> {
        this.isChoiceFinal = true;
        return this.http.post<boolean>(`${environment.serverUrl}/game/correct`, {
            clientAnswers: this.currentChoices,
            questionText,
            quizId: this.quizId,
        });
    }

    getAnswers(question: Question): string[] {
        if (question.choices) return question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
        return [];
    }

    isValidAnswer(questionIndex: number): Observable<boolean> {
        return this.socketService.isAnswerValid({ answers: this.currentChoices, questionIndex });
    }
}
