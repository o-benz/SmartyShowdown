import { Component } from '@angular/core';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';

@Component({
    selector: 'app-import-quiz',
    templateUrl: './import-quiz.component.html',
    styleUrls: ['./import-quiz.component.scss'],
})
export class ImportQuizComponent {
    constructor(private checker: JsonQuizCheckService) {}

    onFileChange(event: { target: unknown }) {
        if ((event as { target: { files: File[] } }).target.files[0]) {
            this.checker.verifyInput((event as { target: { files: File[] } }).target.files[0]);
        }
    }
}
