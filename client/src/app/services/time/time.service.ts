import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class TimeService {
    timerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

    private interval: number | undefined;
    private readonly tick = 1000;

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stopTimer();
                this.timerEvent.emit(true);
            }
        }, this.tick);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
