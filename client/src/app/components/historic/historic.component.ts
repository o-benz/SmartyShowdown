import { Component, OnInit } from '@angular/core';
import { HistoricGame } from '@app/interfaces/historic-game';
import { HistoricService } from '@app/services/historic/historic.service';

@Component({
    selector: 'app-historic-games',
    templateUrl: './historic.component.html',
    styleUrls: ['./historic.component.scss'],
})
export class HistoricComponent implements OnInit {
    historicGames: HistoricGame[];
    sortBy = 'gameName';
    sortOrder = 'asc';

    isSortingByName = true;
    isAscending = true;

    constructor(private historicService: HistoricService) {}

    ngOnInit(): void {
        this.loadHistoricGames();
    }

    loadHistoricGames(): void {
        this.historicService.getHistoricGames(this.sortBy, this.sortOrder).subscribe({
            next: (games) => {
                this.historicGames = games;
            },
        });
    }

    toggleSortCriteria(): void {
        this.isSortingByName = !this.isSortingByName;
        this.sortBy = this.isSortingByName ? 'gameName' : 'date';
        this.loadHistoricGames();
    }

    toggleSortOrder(): void {
        this.isAscending = !this.isAscending;
        this.sortOrder = this.isAscending ? 'asc' : 'desc';
        this.loadHistoricGames();
    }

    resetHistoricGames(): void {
        this.historicService.resetHistoric().subscribe({
            next: () => {
                this.loadHistoricGames();
            },
        });
    }
}
