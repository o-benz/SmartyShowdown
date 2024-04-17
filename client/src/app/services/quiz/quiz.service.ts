import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQuestion } from '@app/interfaces/question-model';
import { Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { DEFAULT_DURATION, LENGTH_ID, MIN_QUIZ_AMOUNT, RANDOM_OFFSET } from '@app/services/constants';
import { QuestionService } from '@app/services/question/question.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    constructor(
        private http: HttpClient,
        private questionService: QuestionService,
    ) {}

    getAllQuiz(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${environment.serverUrl}/quiz`);
    }

    getQuizById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${environment.serverUrl}/quiz/${id}`);
    }

    addQuiz(quiz: Quiz): Observable<boolean> {
        return this.http.post<boolean>(`${environment.serverUrl}/quiz`, quiz);
    }

    async generateRandomQuiz(): Promise<Quiz> {
        const questions = await this.generateQuestions();
        const randomQuiz = {
            id: this.generateRandomID(LENGTH_ID),
            visible: true,
            title: QuizEnum.RANDOMMODE,
            description: QuizEnum.RANDOMDESCRIPTION,
            duration: DEFAULT_DURATION,
            lastModification: new Date().toLocaleDateString(undefined, { timeZone: 'UTC' }),
            questions,
        };
        return randomQuiz;
    }

    addQuizToList(quiz: Quiz, quizList: Quiz[]): Quiz[] {
        quizList.unshift(quiz);
        return quizList;
    }

    async generateQuestions(): Promise<BaseQuestion[]> {
        return new Promise((resolve, reject) => {
            this.fetchQuestions((questions) => {
                if (questions.length === 0) {
                    reject('Failed to fetch questions');
                } else {
                    resolve(questions.sort(() => RANDOM_OFFSET - Math.random()).slice(0, MIN_QUIZ_AMOUNT));
                }
            });
        });
    }

    generateRandomID(len: number) {
        let output = '';
        for (let i = 0; i < len; ++i) {
            output += QuizEnum.IDHEX.charAt(Math.floor(Math.random() * QuizEnum.IDHEX.length));
        }
        return output;
    }

    private fetchQuestions(callback: (questions: BaseQuestion[]) => void): void {
        this.questionService.getAllMultipleChoiceQuestions().subscribe((qcm) => {
            callback(qcm);
        });
    }
}
