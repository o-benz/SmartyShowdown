import { Component } from '@angular/core';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';

@Component({
    selector: 'app-import-quiz',
    templateUrl: './import-quiz.component.html',
    styleUrls: ['./import-quiz.component.scss'],
})
export class ImportQuizComponent {
    constructor(private checker: JsonQuizCheckService) {}

    onFileChange(event: Event) {
        const file = (event.target as HTMLInputElement).files;
        if (file) {
            this.checker.importQuiz(file[0]);
        }
    }
}
