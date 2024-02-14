import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz-model';

@Injectable({
    providedIn: 'root',
})
export class QuizImportService {
    async readFileAsQuiz(file: File): Promise<Quiz> {
        const quizText: string = await this.readFileContent(file);
        return JSON.parse(quizText) as Quiz;
    }

    private async readFileContent(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event?.target?.result as string | null;
                if (content) {
                    resolve(content);
                } else {
                    reject(new Error('Failed to read file content'));
                }
            };
            reader.onerror = (event) => {
                reject(new Error(`Error reading file: ${(event.target as FileReader).error}`));
            };
            reader.readAsText(file);
        });
    }
}
