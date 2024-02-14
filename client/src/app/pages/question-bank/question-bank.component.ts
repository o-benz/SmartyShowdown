import { Component } from '@angular/core';
import { QuestionModel } from '@app/interfaces/question-model';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent {
    questionList: QuestionModel[];
}
