import { Injectable } from '@angular/core';
import { PlayerInfo } from '@app/interfaces/game-stats';

const MINUS_ONE = -1;

@Injectable({
    providedIn: 'root',
})
export class StatService {
    sortPlayerByPoints(players: PlayerInfo[]): PlayerInfo[] {
        return players.sort((playerOne, playerTwo) => {
            if ((playerOne.score ?? 0) > (playerTwo.score ?? 0)) return MINUS_ONE;
            if ((playerOne.score ?? 0) < (playerTwo.score ?? 0)) return 1;
            return playerOne.name.localeCompare(playerTwo.name);
        });
    }

    staysInInterval(last: number, value: number, first: number = 0): boolean {
        return value >= first && value <= last;
    }
}
