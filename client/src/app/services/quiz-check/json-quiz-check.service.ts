import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImportErrorComponent } from '@app/components/import-error/import-error.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { Quiz } from '@app/interfaces/quiz-model';

@Injectable({
    providedIn: 'root',
})
export class JsonQuizCheckService {
    constructor(private dialog: MatDialog) {}

    async nameCheck(quiz: Quiz) {
        const errorComponent = this.handleErrorMessage('Un quiz a ce nom existe deja');
        return new Promise((resolve, reject) => {
            errorComponent.componentInstance.prepareNameCheck(
                quiz,
                QuizListComponent.quizzes.map((value) => value.title),
            );
            errorComponent.afterClosed().subscribe((quizNewName) => {
                if (quizNewName) {
                    resolve(quizNewName);
                } else {
                    reject("Un nouveau nom n'a pas été sélectionné");
                }
            });
        });
    }

    handleErrorMessage(message: string): MatDialogRef<ImportErrorComponent> {
        const errorComponent = this.dialog.open(ImportErrorComponent);
        errorComponent.componentInstance.message = message;
        return errorComponent;
    }

    isNameAvailable(quiz: Quiz): boolean {
        return !QuizListComponent.quizzes.some((value: Quiz) => value.title === quiz.title);
    }
}
