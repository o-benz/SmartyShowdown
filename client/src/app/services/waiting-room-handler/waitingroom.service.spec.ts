import { TestBed } from '@angular/core/testing';

import { WaitingRoomService } from './waitingroom.service';

describe('WaitingroomService', () => {
    let service: WaitingRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitingRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true when usernames match in isBannable', () => {
        const username = 'testUser';
        const user = { username: 'testUser', answered: false };
        const result = service.isBannable(username, user);
        expect(result).toBe(true);
    });

    it('should return false when usernames do not match in isBannable', () => {
        const username = 'testUser';
        const user = { username: 'otherUser', answered: false };
        const result = service.isBannable(username, user);
        expect(result).toBe(false);
    });

    it('should filter out the user with matching username in filterBannedUsers', () => {
        const username = 'bannedUser';
        const userList = [
            { username: 'bannedUser', answered: false },
            { username: 'user1', answered: false },
            { username: 'user2', answered: false },
        ];
        const filteredList = service.filterBannedUsers(userList, username);
        expect(filteredList).toEqual([
            { username: 'user1', answered: false },
            { username: 'user2', answered: false },
        ]);
    });

    it('should not filter out any user if username does not match in filterBannedUsers', () => {
        const username = 'nonExistentUser';
        const userList = [
            { username: 'user1', answered: false },
            { username: 'user2', answered: false },
            { username: 'user3', answered: false },
        ];
        const filteredList = service.filterBannedUsers(userList, username);
        expect(filteredList).toEqual(userList);
    });
});
