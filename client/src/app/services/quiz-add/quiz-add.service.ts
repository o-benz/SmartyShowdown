import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz-model';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';

@Injectable({
    providedIn: 'root',
})
export class QuizAddService {
    constructor(
        private router: Router,
        private jsonCheckService: JsonQuizCheckService,
        private quizService: QuizService,
    ) {}

    addToQuizList(quiz: Quiz) {
        this.quizService.addQuiz(quiz).subscribe({
            next: () => {
                this.stealthPageReload();
            },
            error: () => {
                this.jsonCheckService.handleErrorMessage("Erreur lors de l'ajou du quiz au database");
            },
        });
    }

    private async stealthPageReload() {
        this.router.navigateByUrl('/', { skipLocationChange: true });
        this.router.navigate(['/admin']);
    }
}
