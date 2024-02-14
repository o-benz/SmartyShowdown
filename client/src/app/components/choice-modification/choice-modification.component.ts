import { Component, Input } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { ChoiceService } from '@app/services/choice/choice.service';

@Component({
    selector: 'app-choice-modification',
    templateUrl: './choice-modification.component.html',
    styleUrls: ['./choice-modification.component.scss'],
})
export class ChoiceModificationComponent {
    @Input() choice: Choice;
    @Input() selectedQuestion: Question;

    constructor(private choiceService: ChoiceService) {}

    deleteMultipleChoice(choice: Choice): void {
        this.choiceService.deleteMultipleChoice(choice, this.selectedQuestion);
    }

    placeChoiceHigher(choice: Choice): void {
        this.choiceService.placeHigher(choice, this.selectedQuestion);
    }

    placeChoiceLower(choice: Choice): void {
        this.choiceService.placeLower(choice, this.selectedQuestion);
    }
}
