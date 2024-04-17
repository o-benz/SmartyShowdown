import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audio = new Audio();
    constructor() {
        this.audio.src = './assets/panic.mp3';
        this.audio.load();
    }

    playAudio() {
        this.audio.play();
    }
}
