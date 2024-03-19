import { TestBed } from '@angular/core/testing';

import { StatService } from './stats.service';

describe('StatsService', () => {
    let service: StatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sortPlayerByPoints should sort the list by point amount', () => {
        const players = [
            { name: 'Player A', score: 10 },
            { name: 'Player B', score: 5 },
            { name: 'Player C', score: 15 },
        ];

        const sortedPlayers = service.sortPlayerByPoints(players);

        expect(sortedPlayers).toEqual([
            { name: 'Player C', score: 15 },
            { name: 'Player A', score: 10 },
            { name: 'Player B', score: 5 },
        ]);
    });

    it('sortPlayerByPoints should sort the list alphabetically when points equal', () => {
        const players = [
            { name: 'B', score: 10 },
            { name: 'A', score: 10 },
            { name: 'C', score: 10 },
        ];

        const sortedPlayers = service.sortPlayerByPoints(players);

        expect(sortedPlayers).toEqual([
            { name: 'A', score: 10 },
            { name: 'B', score: 10 },
            { name: 'C', score: 10 },
        ]);
    });

    it('sortPlayerByPoints should not throw errors if points are missing', () => {
        const players = [{ name: 'Player B' }, { name: 'Player A' }, { name: 'Player C' }];

        const sortedPlayers = service.sortPlayerByPoints(players);

        expect(sortedPlayers).toEqual([{ name: 'Player A' }, { name: 'Player B' }, { name: 'Player C' }]);
    });

    it('should only return true if value is within the interval', () => {
        expect(service.staysInInterval(5, 3)).toBeTrue(); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(service.staysInInterval(5, 10)).toBeFalse(); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(service.staysInInterval(5, 1, 2)).toBeFalse(); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });
});
