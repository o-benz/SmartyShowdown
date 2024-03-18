import { EventEmitter, Injectable } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';

@Injectable()
export class TimeService {
    timerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    countdownEvent: EventEmitter<number> = new EventEmitter<number>();

    private readonly tick = 1000;
    private counter = 0;
    private timerSubscription!: Subscription | undefined;

    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.timerSubscription && !this.timerSubscription.closed) return;
        this.time = startValue;

        this.timerSubscription = interval(this.tick)
            .pipe(
                tap(() => this.time--),
                takeWhile(() => this.time >= 0),
            )
            .subscribe({
                next: () => {
                    if (this.time <= 0) {
                        this.stopTimer();
                        this.timerEvent.emit(true);
                    }
                },
                complete: () => {
                    this.stopTimer();
                    this.timerEvent.emit(true);
                },
            });
    }

    stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = undefined;
        }
    }
}
