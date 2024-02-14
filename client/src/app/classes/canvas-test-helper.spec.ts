import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

describe('CanvasTestHelper', () => {
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
    });

    it('should be created', () => {
        expect(canvasTestHelper).toBeTruthy();
    });

    it('createCanvas should create a HTMLCanvasElement with good dimensions', () => {
        const width = 15;
        const height = 25;
        // eslint-disable-next-line -- createCanvas is private and we need access for the test
        const canvas = CanvasTestHelper.createCanvas(width, height);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(width);
        expect(canvas.height).toBe(height);
    });
});
