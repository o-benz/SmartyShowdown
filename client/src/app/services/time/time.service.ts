import { EventEmitter, Injectable } from '@angular/core';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';

@Injectable()
export class TimeService {
    timerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    countdownEvent: EventEmitter<number> = new EventEmitter<number>();

    private counter = 0;
    private isTimerActive = false;

    constructor(private socketService: SocketCommunicationService) {
        this.socketService.onTick(() => {
            if (this.isTimerActive) {
                this.time--;
                if (this.time <= 0) {
                    this.stopTimer();
                    this.timerEvent.emit(true);
                }
            }
        });
    }

    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.isTimerActive) return;

        this.isTimerActive = true;
        this.time = startValue;
    }

    stopTimer() {
        this.isTimerActive = false;
    }
}
