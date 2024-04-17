import { TestBed } from '@angular/core/testing';
import { CountdownService } from './countdown.service';

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

    it('should start countdown and emit countdownTick', (done) => {
        const duration = 3;
        let tickCount = 0;
        service.countdownTick.subscribe((value: number) => {
            tickCount++;
            expect(value).toBe(duration - tickCount);
            if (value === 0) {
                done();
            }
        });

        service.startCountdown(duration);
    });

    it('should emit countdownEnded when countdown finishes', (done) => {
        const duration = 1;
        let tickCount = 0;
        service.countdownTick.subscribe(() => {
            tickCount++;
        });
        service.countdownEnded.subscribe(() => {
            expect(tickCount).toBe(1);
            done();
        });

        service.startCountdown(duration);
    });
});
