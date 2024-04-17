import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizAddService } from '@app/services/quiz-add/quiz-add.service';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';

@Injectable({
    providedIn: 'root',
})
export class QuizImportService {
    constructor(
        private checkService: QuizValueCheckService,
        private jsonCheckService: JsonQuizCheckService,
        private quizAddService: QuizAddService,
    ) {}

    async importQuiz(quizFile: File): Promise<void> {
        return this.readQuizFromFile(quizFile)
            .then((unsafeQuiz) => {
                if (unsafeQuiz) {
                    this.handleUnsafeQuiz(unsafeQuiz);
                }
            })
            .catch();
    }

    private async readQuizFromFile(quizFile: File): Promise<Quiz> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event?.target?.result as string | null;
                if (content) {
                    try {
                        resolve(JSON.parse(content) as Quiz);
                    } catch (error) {
                        this.jsonCheckService.handleErrorMessage("erreur dans la lecture du fichier, fichier n'est pas un JSON");
                        resolve(null as unknown as Quiz);
                    }
                } else {
                    this.jsonCheckService.handleErrorMessage('erreur dans la lecture du fichier, fichier vide');
                    resolve(null as unknown as Quiz);
                }
            };
            reader.readAsText(quizFile);
        });
    }

    private async handleUnsafeQuiz(unsafeQuiz: Quiz): Promise<void> {
        this.checkService.checkQuiz(unsafeQuiz);
        if (this.checkService.isValidQuiz()) {
            await this.handleQuizImport();
        } else {
            this.jsonCheckService.handleErrorMessage(this.checkService.getMessage());
        }
    }

    private async handleQuizImport(): Promise<void> {
        if (this.jsonCheckService.isNameAvailable(this.checkService.sanitizedQuiz)) {
            this.quizAddService.addToQuizList(this.checkService.sanitizedQuiz);
        } else {
            await this.quizNameCheck();
        }
    }

    private async quizNameCheck(): Promise<void> {
        return this.jsonCheckService
            .nameCheck(this.checkService.sanitizedQuiz)
            .then((quizNewName) => {
                if (quizNewName) {
                    this.quizAddService.addToQuizList(quizNewName as Quiz);
                } else {
                    this.jsonCheckService.handleErrorMessage("Un nouveau nom n'a pas été sélectionné");
                }
            })
            .catch((error) => {
                this.jsonCheckService.handleErrorMessage(error.message);
            });
    }
}
