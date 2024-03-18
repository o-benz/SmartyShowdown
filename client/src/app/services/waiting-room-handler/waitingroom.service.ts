import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/socket-model';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomService {
    isBannable(username: string, user: User): boolean {
        return username === user.username;
    }

    filterBannedUsers(userList: User[], username: string): User[] {
        return userList.filter((user) => user.username !== username);
    }
}
