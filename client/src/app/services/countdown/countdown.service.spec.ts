import { TestBed } from '@angular/core/testing';
import { CountdownService } from './countdown.service';

const DURATION = 1000;

describe('CountdownService', () => {
    let service: CountdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CountdownService);
    });

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit countdownEnded when countdown finishes', (done) => {
        const duration = 1;

        service.countdownEnded.subscribe({
            next: () => {
                /* Disabling empty function warning for next method */
            },
            complete: () => {
                done();
            },
        });

        service.startCountdown(duration);

        setTimeout(() => done(), (duration + 1) * DURATION);
    });
});
