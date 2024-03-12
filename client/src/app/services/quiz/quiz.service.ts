import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { DEFAULT_DURATION, LENGTH_ID, MIN_QUIZ_AMOUNT, RANDOM_OFFSET, SMALLEST_INDEX } from '@app/services/constants';
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

    fetchQuestions(callback: (questions: Question[]) => void): void {
        this.questionService.getAllQuestions().subscribe((qcm) => {
            callback(qcm);
        });
    }

    generateRandomQuiz(quizList: Quiz[]): Quiz[] {
        const questionsRandom: Question[] = [];
        const newQuizList = [...quizList];
        let qcmList: Question[] = [];
        this.fetchQuestions((questions) => {
            qcmList = questions;
            if (qcmList.length >= MIN_QUIZ_AMOUNT) {
                const randomQuiz = {
                    id: this.generateRandomID(LENGTH_ID),
                    visible: true,
                    title: QuizEnum.RANDOMMODE,
                    description: QuizEnum.RANDOMDESCRIPTION,
                    duration: DEFAULT_DURATION,
                    lastModification: new Date().toLocaleDateString(undefined, { timeZone: 'UTC' }),
                    questions: this.generateQuestions(questionsRandom),
                };
                const randomQuizIndex = newQuizList.findIndex((quiz) => quiz.title === QuizEnum.RANDOMMODE);
                if (randomQuizIndex !== SMALLEST_INDEX) newQuizList[randomQuizIndex] = randomQuiz;
                else newQuizList.push(randomQuiz);
            }
        });
        return newQuizList;
    }

    generateQuestions(questionsRandom: Question[]) {
        return questionsRandom.sort(() => RANDOM_OFFSET - Math.random()).slice(0, MIN_QUIZ_AMOUNT);
    }

    generateRandomID(len: number) {
        let output = '';
        for (let i = 0; i < len; ++i) {
            output += QuizEnum.IDHEX.charAt(Math.floor(Math.random() * QuizEnum.IDHEX.length));
        }
        return output;
    }
}
