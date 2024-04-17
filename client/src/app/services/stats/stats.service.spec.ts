import { TestBed } from '@angular/core/testing';

import { PlayerState } from '@app/interfaces/game-stats';
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

    it('sortPlayerByPoints should sort players by point in ascending and descending order', () => {
        const players = [
            { name: 'Player A', score: 10 },
            { name: 'Player B', score: 5 },
            { name: 'Player C', score: 15 },
        ];

        let sortedPlayers = service.sortPlayerByPoints(players, true);

        expect(sortedPlayers).toEqual([
            { name: 'Player B', score: 5 },
            { name: 'Player A', score: 10 },
            { name: 'Player C', score: 15 },
        ]);

        sortedPlayers = service.sortPlayerByPoints(players, false);

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

        const sortedPlayers = service.sortPlayerByPoints(players, true);

        expect(sortedPlayers).toEqual([
            { name: 'A', score: 10 },
            { name: 'B', score: 10 },
            { name: 'C', score: 10 },
        ]);
    });

    it('sortPlayerByPoints should not throw errors if points are missing', () => {
        const players = [{ name: 'Player B' }, { name: 'Player A' }, { name: 'Player C' }];

        const sortedPlayers = service.sortPlayerByPoints(players, true);

        expect(sortedPlayers).toEqual([{ name: 'Player A' }, { name: 'Player B' }, { name: 'Player C' }]);
    });

    it('should only return true if value is within the interval', () => {
        expect(service.staysInInterval(5, 3)).toBeTrue(); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(service.staysInInterval(5, 10)).toBeFalse(); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(service.staysInInterval(5, 1, 2)).toBeFalse(); // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

    it('sortPlayerByUserName should sort players by username in ascending and descending order', () => {
        const players = [
            { name: 'John', score: 10 },
            { name: 'Alice', score: 5 },
            { name: 'Bob', score: 15 },
        ];

        let sortedPlayers = service.sortPlayerByUserName(players, true);

        expect(sortedPlayers).toEqual([
            { name: 'Alice', score: 5 },
            { name: 'Bob', score: 15 },
            { name: 'John', score: 10 },
        ]);

        sortedPlayers = service.sortPlayerByUserName(players, false);

        expect(sortedPlayers).toEqual([
            { name: 'John', score: 10 },
            { name: 'Bob', score: 15 },
            { name: 'Alice', score: 5 },
        ]);
    });

    it('sortPlayerByState should sort players by state in ascending and descending order', () => {
        const players = [
            { name: 'John', state: PlayerState.NoInteraction },
            { name: 'Alice', state: PlayerState.FirstInteraction },
            { name: 'Bob', state: PlayerState.PlayerLeft },
        ];

        let sortedPlayers = service.sortPlayerByState(players, true);

        expect(sortedPlayers).toEqual([
            { name: 'Bob', state: PlayerState.PlayerLeft },
            { name: 'John', state: PlayerState.NoInteraction },
            { name: 'Alice', state: PlayerState.FirstInteraction },
        ]);

        sortedPlayers = service.sortPlayerByState(players, false);

        expect(sortedPlayers).toEqual([
            { name: 'Alice', state: PlayerState.FirstInteraction },
            { name: 'John', state: PlayerState.NoInteraction },
            { name: 'Bob', state: PlayerState.PlayerLeft },
        ]);
    });

    it('sortPlayerByState should sort the list alphabetically when states equal', () => {
        const players = [
            { name: 'John', state: PlayerState.NoInteraction },
            { name: 'Alice', state: PlayerState.NoInteraction },
            { name: 'Bob', state: PlayerState.NoInteraction },
        ];

        const sortedPlayers = service.sortPlayerByState(players, true);

        expect(sortedPlayers).toEqual([
            { name: 'Alice', state: PlayerState.NoInteraction },
            { name: 'Bob', state: PlayerState.NoInteraction },
            { name: 'John', state: PlayerState.NoInteraction },
        ]);
    });

    it('sortPlayerByState should not throw errors if state are missing', () => {
        const players = [{ name: 'Player B' }, { name: 'Player A' }, { name: 'Player C' }];

        const sortedPlayers = service.sortPlayerByState(players, true);

        expect(sortedPlayers).toEqual([{ name: 'Player A' }, { name: 'Player B' }, { name: 'Player C' }]);
    });
});
