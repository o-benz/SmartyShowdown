import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginFormComponent } from '@app/components/login-form/login-form.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(private dialog: MatDialog) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    joinGameParty(): void {}

    manageGames(): void {
        this.dialog.open(LoginFormComponent);
    }
}
