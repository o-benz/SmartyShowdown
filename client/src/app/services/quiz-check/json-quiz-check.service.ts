import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImportErrorComponent } from '@app/components/import-error/import-error.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizService } from '@app/services/quiz/quiz.service';

@Injectable({
    providedIn: 'root',
})
export class JsonQuizCheckService {
    private quizzes: Quiz[] = [];
    constructor(
        private dialog: MatDialog,
        private quizService: QuizService,
    ) {
        this.getQuizzes();
    }

    async nameCheck(quiz: Quiz) {
        const errorComponent = this.handleErrorMessage('Un quiz a ce nom existe deja');
        return new Promise((resolve, reject) => {
            errorComponent.componentInstance.prepareNameCheck(
                quiz,
                this.quizzes.map((value) => value.title),
            );
            errorComponent.afterClosed().subscribe((quizNewName) => {
                if (quizNewName) {
                    resolve(quizNewName);
                } else {
                    reject(new Error("Un nouveau nom n'a pas été sélectionné"));
                }
            });
        });
    }

    handleErrorMessage(message: string): MatDialogRef<ImportErrorComponent> {
        const errorComponent = this.dialog.open(ImportErrorComponent, {
            width: '50%',
        });
        errorComponent.componentInstance.message = message;
        return errorComponent;
    }

    isNameAvailable(quiz: Quiz): boolean {
        this.getQuizzes();
        return !this.quizzes.some((value: Quiz) => value.title === quiz.title);
    }

    private async getQuizzes() {
        this.quizService.getAllQuiz().subscribe((quizzes) => {
            this.quizzes = quizzes;
        });
    }
}
