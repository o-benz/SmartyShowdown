import { TestBed } from '@angular/core/testing';

import { StatService } from './stats.service';

describe('StatsService', () => {
    let service: StatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
