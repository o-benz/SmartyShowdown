import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { TimeService } from './time.service';

describe('TimeService', () => {
    let timeService: TimeService;
    const TIMEOUT = 5;
    const MS_SECOND = 1000;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TimeService],
        });
        timeService = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(timeService).toBeTruthy();
    });

    it('startTimer should initialize time and decrease it every second', fakeAsync(() => {
        timeService.startTimer(TIMEOUT);
        expect(timeService.time).toEqual(TIMEOUT);
        tick(MS_SECOND);
        expect(timeService.time).toEqual(TIMEOUT - 1);
        tick(MS_SECOND * (TIMEOUT - 1));
        expect(timeService.time).toEqual(0);
        flush();
    }));

    it('timer should emit event when time reaches zero', fakeAsync(() => {
        let timerFinished = false;
        timeService.timerEvent.subscribe(() => {
            timerFinished = true;
        });

        timeService.startTimer(1);
        tick(MS_SECOND);
        expect(timerFinished).toBeTrue();
        flush();
    }));

    it('startTimer should not start a new timer if one is already running', fakeAsync(() => {
        timeService.startTimer(TIMEOUT);
        tick(MS_SECOND);
        timeService.startTimer(TIMEOUT);
        expect(timeService.time).toEqual(TIMEOUT - 1);
        timeService.stopTimer();
        flush();
    }));

    it('stopTimer should stop the timer', fakeAsync(() => {
        timeService.startTimer(TIMEOUT);
        tick(MS_SECOND * 2);
        timeService.stopTimer();
        tick(MS_SECOND * 3);
        expect(timeService.time).toEqual(TIMEOUT - 2);
        flush();
    }));
});
