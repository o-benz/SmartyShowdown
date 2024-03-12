import { Component, Input } from '@angular/core';
import { PlayerInfo } from '@app/interfaces/game-stats';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-player-list-result',
    templateUrl: './player-list-result.component.html',
    styleUrls: ['./player-list-result.component.scss'],
})
export class PlayerListResultComponent {
    @Input() players: Observable<PlayerInfo[]>;
}
