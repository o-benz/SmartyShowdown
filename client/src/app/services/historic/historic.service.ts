import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HistoricGame } from '@app/interfaces/historic-game';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HistoricService {
    private url = `${environment.serverUrl}/historic`;

    constructor(private http: HttpClient) {}

    getHistoricGames(sortBy: string = 'date', sortOrder: string = 'asc'): Observable<HistoricGame[]> {
        const params = { sortBy, sortOrder };
        return this.http.get<HistoricGame[]>(this.url, { params });
    }

    resetHistoric(): Observable<unknown> {
        return this.http.delete(`${this.url}/reset`);
    }
}
