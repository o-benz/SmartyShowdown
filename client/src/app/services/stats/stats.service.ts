import { Injectable } from '@angular/core';
import { PlayerInfo } from '@app/interfaces/game-stats';

const MINUS_ONE = -1;

@Injectable({
    providedIn: 'root',
})
export class StatService {
    sortPlayerByPoints(players: PlayerInfo[], isAscending: boolean): PlayerInfo[] {
        const list = players.sort((playerOne, playerTwo) => {
            if ((playerOne.score ?? 0) > (playerTwo.score ?? 0)) return 1;
            if ((playerOne.score ?? 0) < (playerTwo.score ?? 0)) return MINUS_ONE;
            return playerOne.name.localeCompare(playerTwo.name);
        });
        return isAscending ? list : list.reverse();
    }

    sortPlayerByUserName(players: PlayerInfo[], isAscending: boolean): PlayerInfo[] {
        const list = players.sort((playerOne, playerTwo) => {
            return playerOne.name.localeCompare(playerTwo.name);
        });
        return isAscending ? list : list.reverse();
    }

    sortPlayerByState(players: PlayerInfo[], isAscending: boolean): PlayerInfo[] {
        const list = players.sort((playerOne, playerTwo) => {
            if ((playerOne.state ?? 0) > (playerTwo.state ?? 0)) return 1;
            if ((playerOne.state ?? 0) < (playerTwo.state ?? 0)) return MINUS_ONE;
            return playerOne.name.localeCompare(playerTwo.name);
        });
        return isAscending ? list : list.reverse();
    }

    staysInInterval(last: number, value: number, first: number = 0): boolean {
        return value >= first && value <= last;
    }
}
