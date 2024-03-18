import { Component } from '@angular/core';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';

@Component({
    selector: 'app-dialog-error',
    templateUrl: './dialog-error.component.html',
    styleUrls: ['./dialog-error.component.scss'],
})
export class DialogErrorComponent {
    constructor(private dialogService: DialogErrorService) {}

    get errorMessage(): string {
        return this.dialogService.getErrorMessage();
    }
}
