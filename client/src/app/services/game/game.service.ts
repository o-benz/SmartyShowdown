import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameStats } from '@app/interfaces/game-stats';
import { BaseQuestion, Choice } from '@app/interfaces/question-model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentChoices: Choice[] = [];
    score: number = 0;
    previousScore: number = 0;
    quizId: string;
    isChoiceFinal: boolean = false;
    readonly bonus: number = 1.2;
    constructor(private http: HttpClient) {}

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

    getAnswers(question: BaseQuestion): string[] {
        if (question.choices) return question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.text);
        return [];
    }

    gamestatsToQuestions(gameStats: GameStats): BaseQuestion[] {
        return gameStats.questions.map((question) => {
            return {
                text: question.title,
                type: question.type,
                points: question.points,
                choices: question.statLines.map((line) => {
                    return { text: line.label, isCorrect: line.isCorrect };
                }),
            };
        });
    }

    giveUserPoints(currentQuestion: BaseQuestion): void {
        if (currentQuestion.type === 'QCM') this.score += currentQuestion.points * this.bonus;
        else if (currentQuestion.type === 'QRL') this.score += currentQuestion.points;
    }
}
