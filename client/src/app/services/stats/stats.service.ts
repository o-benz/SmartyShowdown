import { Injectable } from '@angular/core';
import { PlayerInfo } from '@app/interfaces/game-stats';

@Injectable({
    providedIn: 'root',
})
export class StatService {
    static sortPlayerByPoints(players: PlayerInfo[]): PlayerInfo[] {
        return players.sort((playerOne, playerTwo) => {
            if (!playerOne.score) playerOne.score = 0;
            if (!playerTwo.score) playerTwo.score = 0;
            return playerTwo.score - playerOne.score;
        });
    }
}
