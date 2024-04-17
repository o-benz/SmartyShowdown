import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HistoricGame } from '@app/interfaces/historic-game';
import { Quiz } from '@app/interfaces/quiz-model';
@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    quizList: Quiz[];
    historicGames: HistoricGame[];
    sortBy = 'gameName';
    sortOrder = 'asc';

    constructor(public dialog: MatDialog) {}
}
