import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ImportErrorComponent } from '@app/components/import-error/import-error.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { Quiz } from '@app/interfaces/quiz-model';
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
        private checkService: QuizValueCheckService,
        private router: Router,
    ) {}
    /*eslint-enabled*/

    importQuiz(quizFile: File): Promise<void>{
        return this.readQuizFromFile(quizFile).then((unsafeQuiz) => {
            if(unsafeQuiz){
            this.checkService.checkQuiz(unsafeQuiz);

            if (this.checkService.isValidQuiz()) {
                if (this.isNameAvailable(this.checkService.sanitizedQuiz)) {
                    this.addToQuizList(this.checkService.sanitizedQuiz);
                } else {
                    this.nameCheck(this.checkService.sanitizedQuiz);
                }
            } else {
                this.handleErrorMessage(this.checkService.getMessage());
            }
        }}).catch();
    }

    private readQuizFromFile(quizFile: File) : Promise<Quiz>{
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event?.target?.result as string | null;
                if (content) {
                    try {
                        resolve(JSON.parse(content) as Quiz);
                    } catch (error) {
                        this.handleErrorMessage("erreur dans la lecture du fichier, fichier n'est pas un JSON");
                        resolve(null as unknown as Quiz);
                    }
                } else {
                    this.handleErrorMessage("erreur dans la lecture du fichier, fichier vide");
                    resolve(null as unknown as Quiz);
                }
            };
            reader.readAsText(quizFile);
        });
    }

    private nameCheck(quiz: Quiz) {
        const errorComponent = this.handleErrorMessage('Un quiz a ce nom existe deja');
        errorComponent.componentInstance.prepareNameCheck(quiz,
            QuizListComponent.quizzes.map((value) => value.title),
        );
        errorComponent.afterClosed().subscribe((quizNewName) =>
                quizNewName ? this.addToQuizList(quizNewName) : this.handleErrorMessage("Un nouveau nom n'a pas été sélectionné"),
        );
    }

    private addToQuizList(quiz: Quiz) {
        this.quizService.addQuiz(quiz).subscribe({
            next: () => {
                this.stealthPageReload();
            },
            error: () => {
                this.handleErrorMessage("Erreur lors de l'ajou du quiz au database");
            },
        });
    }

    private handleErrorMessage(message: string): MatDialogRef<ImportErrorComponent> {
        const errorComponent = this.dialog.open(ImportErrorComponent);
        errorComponent.componentInstance.message = message;
        return errorComponent;
    }

    private isNameAvailable(quiz:Quiz):Boolean{
        return !QuizListComponent.quizzes.some((value: Quiz) => value.title === quiz.title);
    }

    private async stealthPageReload() {
        await this.router.navigateByUrl('/', { skipLocationChange: true });
        this.router.navigate(['/admin']);
    }
}
