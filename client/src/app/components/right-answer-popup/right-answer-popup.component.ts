import { Component } from '@angular/core';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';

@Component({
    selector: 'app-right-answer-popup',
    templateUrl: './right-answer-popup.component.html',
    styleUrls: ['./right-answer-popup.component.scss'],
})
export class RightAnswerPopupComponent {
    constructor(private dialogService: DialogErrorService) {}

    get answerArray(): string[] {
        return this.dialogService.getAnswerArray();
    }

    get errorMessage(): string {
        return this.dialogService.getErrorMessage();
    }

    get pointsGained(): number {
        return this.dialogService.getPointsGained();
    }
}
