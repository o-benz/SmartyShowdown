import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PlayerInfo } from '@app/interfaces/game-stats';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { StatService } from '@app/services/stats/stats.service';

@Component({
    selector: 'app-player-list-organiser',
    templateUrl: './player-list-organiser.component.html',
    styleUrls: ['./player-list-organiser.component.scss'],
})
export class PlayerListOrganiserComponent implements OnInit, OnChanges {
    @Input() players: PlayerInfo[];
    isAscending: boolean = true;
    protected selectedOption: string;

    constructor(
        private statsService: StatService,
        private socketService: SocketCommunicationService,
    ) {}
    ngOnChanges(): void {
        this.sort();
    }

    ngOnInit(): void {
        this.socketService.onPlayerStateChange((playerInfo) => {
            const player = this.players.find((user) => user.name === playerInfo.name);
            if (player) player.state = playerInfo.state;
            this.sort();
        });
        this.selectedOption = 'name';
        this.sort();
    }

    sort() {
        switch (this.selectedOption) {
            case 'name':
                this.players = this.statsService.sortPlayerByUserName(this.players, this.isAscending);
                break;
            case 'score':
                this.players = this.statsService.sortPlayerByPoints(this.players, this.isAscending);
                break;
            case 'state':
                this.players = this.statsService.sortPlayerByState(this.players, this.isAscending);
                break;
        }
    }

    reverseOrder() {
        this.isAscending = !this.isAscending;
        this.players = this.players.reverse();
    }
    mutePlayer(username: string) {
        const selectedPlayer = this.players.find((player) => player.name === username);
        if (selectedPlayer && !selectedPlayer.hasLeft) {
            selectedPlayer.isMuted = !selectedPlayer.isMuted;
            this.socketService.mutePlayer(username);
        }
    }
}
