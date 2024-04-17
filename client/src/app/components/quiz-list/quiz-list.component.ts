import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz-model';
import { AdminQuizHandler } from '@app/services/admin-quiz-handler/admin-quiz-handler.service';
import { NOT_IN_ARRAY } from '@app/services/constants';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.scss'],
})
export class QuizListComponent implements OnInit, OnDestroy {
    @ViewChild('exportLink') exportLink: ElementRef;
    quizzes: Quiz[];
    subscription: Subscription;
    errorMessage: string | null = null;

    constructor(
        private service: QuizService,
        private adminQuizHandler: AdminQuizHandler,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.subscription = this.service.getAllQuiz().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }

    questionBank() {
        this.router.navigate(['/questionbank']);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    modify(quiz: Quiz) {
        this.router.navigate(['/createquiz'], { queryParams: { id: quiz.id } });
    }

    export(quiz: Quiz) {
        this.exportLink.nativeElement.href = this.adminQuizHandler.export(quiz);
        this.exportLink.nativeElement.download = `${quiz.title}.json`;
        this.exportLink.nativeElement.click();
    }

    create() {
        this.router.navigate(['/createquiz']);
    }

    async delete(quizId: string): Promise<void> {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
            this.adminQuizHandler.delete(quizId).subscribe({
                next: () => {
                    this.quizzes = this.quizzes.filter((quiz) => quiz.id !== quizId);
                },
                error: () => {
                    this.errorMessage = 'Erreur lors de la suppression du quiz. Veuillez réessayer.';
                },
            });
        }
    }

    async hide(quiz: Quiz) {
        this.adminQuizHandler.toggleQuizVisibility(quiz.id).subscribe({
            next: (updatedQuiz) => {
                const index = this.quizzes.findIndex((q) => q.id === updatedQuiz.id);
                if (index !== NOT_IN_ARRAY) {
                    this.quizzes[index].visible = updatedQuiz.visible;
                }
                this.errorMessage = null;
            },
            error: () => {
                this.errorMessage = 'Impossible de modifier la visibilité du quiz';
            },
        });
    }
}
