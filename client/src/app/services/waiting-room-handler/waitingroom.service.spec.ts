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

    it('isBannable should return true', () => {
        const username = 'test';
        const user = { username: 'test' };
        expect(service.isBannable(username, user)).toBeTrue();
    });

    it('isBannable should return false', () => {
        const username = 'test';
        const user = { username: 'test2' };
        expect(service.isBannable(username, user)).toBeFalse();
    });
});
