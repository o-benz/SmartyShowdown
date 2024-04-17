import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HistoricGame } from '@app/interfaces/historic-game';
import { environment } from 'src/environments/environment';
import { HistoricService } from './historic.service';

describe('HistoricService', () => {
    let service: HistoricService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HistoricService],
        });
        service = TestBed.inject(HistoricService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get historic games', (done) => {
        const mockHistoricGames: HistoricGame[] = [
            { gameName: 'Game 1', date: '2024-04-01', nPlayers: 4, bestScore: 100 },
            { gameName: 'Game 2', date: '2024-03-31', nPlayers: 3, bestScore: 150 },
        ];

        service.getHistoricGames().subscribe((historicGames) => {
            expect(historicGames).toEqual(mockHistoricGames);
            done();
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/historic?sortBy=date&sortOrder=asc`);
        expect(req.request.method).toBe('GET');
        req.flush(mockHistoricGames);
    });

    it('should reset historic', (done) => {
        service.resetHistoric().subscribe(() => {
            done();
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/historic/reset`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});
