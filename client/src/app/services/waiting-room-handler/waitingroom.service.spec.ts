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
});
