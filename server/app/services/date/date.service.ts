import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
    currentTime(): string {
        return new Date().toString();
    }
}
