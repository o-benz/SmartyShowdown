import { Component } from '@angular/core';
import { QuizImportService } from '@app/services/quiz-import/quiz-import.service';

@Component({
    selector: 'app-import-quiz',
    templateUrl: './import-quiz.component.html',
    styleUrls: ['./import-quiz.component.scss'],
})
export class ImportQuizComponent {
    constructor(private checker: QuizImportService) {}

    onFileChange(event: Event) {
        const file = (event.target as HTMLInputElement).files;
        if (file) {
            this.checker.importQuiz(file[0]);
        }
    }
}
