import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogErrorComponent } from '@app/components/dialog-error/dialog-error.component';

@Injectable({
    providedIn: 'root',
})
export class DialogErrorService {
    private _errorMessage: string;

    constructor(private dialog: MatDialog) {}

    get errorMessage(): string {
        // eslint-disable-next-line no-underscore-dangle
        return this._errorMessage;
    }

    set errorMessage(message: string) {
        // eslint-disable-next-line no-underscore-dangle
        this._errorMessage = message;
    }

    openErrorDialog(message: string): void {
        // eslint-disable-next-line no-underscore-dangle
        this._errorMessage = message;
        this.dialog.open(DialogErrorComponent);
    }
}
