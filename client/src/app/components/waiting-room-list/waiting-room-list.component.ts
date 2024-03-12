import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/interfaces/socket-model';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { WaitingRoomService } from '@app/services/waiting-room-handler/waitingroom.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-list',
    templateUrl: './waiting-room-list.component.html',
    styleUrls: ['./waiting-room-list.component.scss'],
})
export class WaitingRoomListComponent implements OnInit, OnDestroy {
    @Input() isOrganisateur: boolean;
    protected userList: User[] = [];
    private socketSubscription: Subscription;
    private user: User;

    constructor(
        private socketService: SocketCommunicationService,
        private waitingRoomService: WaitingRoomService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.socketSubscription = this.socketService.getListUsers().subscribe((users: User[]) => {
            this.userList = this.userList.concat(users);
        });

        this.socketService.getUser().subscribe((user: User) => {
            this.user = user;
        });

        this.socketService.onUserListUpdated((user: User) => {
            this.userList.push(user);
        });

        this.socketService.onUserLeft((username: string) => {
            this.userList = this.userList.filter((user) => user.username !== username);
            if (this.waitingRoomService.isBannable(username, this.user)) {
                this.router.navigate(['/']);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.socketSubscription) this.socketSubscription.unsubscribe();
    }

    banUser(username: string): void {
        this.socketService.banUser(username);
    }
}
