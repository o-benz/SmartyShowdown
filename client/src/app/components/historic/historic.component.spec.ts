import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricGame } from '@app/interfaces/historic-game';
import { HistoricService } from '@app/services/historic/historic.service';
import { of } from 'rxjs';
import { HistoricComponent } from './historic.component';

describe('HistoricComponent', () => {
    let component: HistoricComponent;
    let fixture: ComponentFixture<HistoricComponent>;
    let historicService: HistoricService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoricComponent],
            imports: [HttpClientTestingModule],
            providers: [HistoricService],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoricComponent);
        component = fixture.componentInstance;
        historicService = TestBed.inject(HistoricService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load historic games on initialization', () => {
        const mockHistoricGames: HistoricGame[] = [
            { gameName: 'Game 1', date: '2024-04-01', nPlayers: 4, bestScore: 100 },
            { gameName: 'Game 2', date: '2024-03-31', nPlayers: 3, bestScore: 150 },
        ];
        spyOn(historicService, 'getHistoricGames').and.returnValue(of(mockHistoricGames));

        fixture.detectChanges();

        expect(component.historicGames).toEqual(mockHistoricGames);
        expect(historicService.getHistoricGames).toHaveBeenCalledWith('gameName', 'asc');
    });

    it('should reset historic games', () => {
        spyOn(historicService, 'resetHistoric').and.returnValue(of(null));
        spyOn(component, 'loadHistoricGames');

        component.resetHistoricGames();

        expect(historicService.resetHistoric).toHaveBeenCalled();
        expect(component.loadHistoricGames).toHaveBeenCalled();
    });

    it('should toggle sort criteria between gameName and date', () => {
        component.toggleSortCriteria();
        expect(component.sortBy).toBe('date');

        component.toggleSortCriteria();
        expect(component.sortBy).toBe('gameName');
    });

    it('should toggle sort order between asc and desc', () => {
        component.toggleSortOrder();
        expect(component.sortOrder).toBe('desc');

        component.toggleSortOrder();
        expect(component.sortOrder).toBe('asc');
    });
});
