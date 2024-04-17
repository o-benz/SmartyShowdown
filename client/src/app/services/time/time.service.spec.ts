import { TestBed, fakeAsync } from '@angular/core/testing';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from './time.service';

describe('TimeService', () => {
    let timeService: TimeService;
    let mockSocketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    // eslint-disable-next-line
    let tickCallback: Function;

    beforeEach(() => {
        mockSocketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['onTick']);

        // eslint-disable-next-line
        mockSocketServiceSpy.onTick.and.callFake((callback: Function) => {
            tickCallback = callback;
        });

        TestBed.configureTestingModule({
            providers: [TimeService, { provide: SocketCommunicationService, useValue: mockSocketServiceSpy }],
        });

        timeService = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(timeService).toBeTruthy();
    });

    it('startTimer should initialize time and decrease it on each tick', fakeAsync(() => {
        timeService.startTimer(3);
        expect(timeService.time).toEqual(3);
        tickCallback();
        expect(timeService.time).toEqual(2);
        tickCallback();
        expect(timeService.time).toEqual(1);

        tickCallback();
        expect(timeService.time).toEqual(0);
    }));

    it('timer should emit event when time reaches zero', fakeAsync(() => {
        let timerFinished = false;
        timeService.timerEvent.subscribe(() => {
            timerFinished = true;
        });

        timeService.startTimer(1);
        tickCallback();
        expect(timerFinished).toBeTrue();
    }));

    it('startTimer should not start a new timer if one is already running', fakeAsync(() => {
        const TIME = 5;
        timeService.startTimer(3);
        tickCallback();
        timeService.startTimer(TIME);
        tickCallback();
        expect(timeService.time).toEqual(1);
    }));

    it('stopTimer should stop the timer', fakeAsync(() => {
        timeService.startTimer(3);
        tickCallback();
        timeService.stopTimer();
        tickCallback();
        expect(timeService.time).toEqual(2);
    }));
});
