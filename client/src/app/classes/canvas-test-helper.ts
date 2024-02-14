import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}
