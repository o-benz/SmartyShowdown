import { Component } from '@angular/core';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';

@Component({
    selector: 'app-dialog-alert',
    templateUrl: './dialog-alert.component.html',
    styleUrls: ['./dialog-alert.component.scss'],
})
export class DialogAlertComponent {
    constructor(private dialogService: DialogAlertService) {}

    get alertMessage(): string {
        return this.dialogService.getAlertMessage();
    }

    get alertType(): string {
        return this.dialogService.getMessageType();
    }
}
