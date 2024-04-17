import { Component } from '@angular/core';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';

@Component({
    selector: 'app-right-answer-popup',
    templateUrl: './right-answer-popup.component.html',
    styleUrls: ['./right-answer-popup.component.scss'],
})
export class RightAnswerPopupComponent {
    constructor(private dialogService: DialogAlertService) {}

    get answerArray(): string[] {
        return this.dialogService.getAlertArray();
    }

    get errorMessage(): string {
        return this.dialogService.getAlertMessage();
    }

    get pointsGained(): number {
        return this.dialogService.getPointsGained();
    }
}
