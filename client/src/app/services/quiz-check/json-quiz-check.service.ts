import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImportErrorComponent } from '@app/components/import-quiz/import-error/import-error/import-error.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizImportService } from '@app/services/quiz-import/quiz-import.service';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';

@Injectable({
    providedIn: 'root',
})
export class JsonQuizCheckService {
    /*eslint-disable*/
    constructor(
        private dialog: MatDialog,
        private quizService: QuizService,
        private importService: QuizImportService,
        private checkService: QuizValueCheckService,
    ) {}
    /*eslint-enabled*/

    async verifyInput(quizFile: File): Promise<void> {
        await this.importService
            .readFileAsQuiz(quizFile)
            .then((value) => {
                this.checkService.checkQuiz(value);

                if (this.checkService.getResult()) {
                    this.nameCheck(this.checkService.getSanitizedQuiz());
                } else {
                    this.handleErrorMessage(this.checkService.getMessage());
                }
            })
            .catch((error) => this.handleErrorMessage('error importing JSON' + error.toString()));
        return;
    }

    nameCheck(quiz: Quiz) {
        const title: string = quiz.title;
        if (QuizListComponent.quizzes.some((value: Quiz) => value.title === title)) {
            const errorComponent = this.handleErrorMessage('Un quiz a ce nom existe deja');
            errorComponent.componentInstance.prepareNameCheck(
                quiz,
                QuizListComponent.quizzes.map((value) => value.title),
            );
            errorComponent
                .afterClosed()
                .subscribe((quizNewName) =>
                    quizNewName ? this.addToQuizList(quizNewName) : this.handleErrorMessage("Un nouveau nom n'a pas été sélectionné"),
                );
        } else {
            this.addToQuizList(quiz);
        }
    }

    addToQuizList(quiz: Quiz) {
        this.quizService.addQuiz(quiz).subscribe({
            next: () => {
                this.stealthPageReload();
            },
            error: () => {
                this.handleErrorMessage("Erreur lors de l'ajou du quiz au database");
            },
        });
    }

    handleErrorMessage(message: string): MatDialogRef<ImportErrorComponent> {
        const errorComponent = this.dialog.open(ImportErrorComponent);
        errorComponent.componentInstance.message = message;
        return errorComponent;
    }

    private stealthPageReload() {
        location.reload();
    }
}
