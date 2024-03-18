import { EventEmitter, Injectable } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const LIMIT = 1000;

@Injectable({
    providedIn: 'root',
})
export class CountdownService {
    countdownEnded = new EventEmitter<void>();
    countdownTick = new EventEmitter<number>();

    private countdownSubscription: Subscription | null = null;

    startCountdown(duration: number) {
        let currentDuration = duration;
        this.countdownSubscription = interval(LIMIT)
            .pipe(
                take(duration + 1),
                map(() => currentDuration--),
            )
            .subscribe((value) => {
                this.countdownTick.emit(value);
                if (value === 0) {
                    this.countdownEnded.emit();
                    this.stopCountdown();
                }
            });
    }

    stopCountdown() {
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
            this.countdownSubscription = null;
        }
    }
}
