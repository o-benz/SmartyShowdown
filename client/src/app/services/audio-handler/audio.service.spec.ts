import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;
    let mockAudio: jasmine.SpyObj<HTMLAudioElement>;

    beforeEach(() => {
        // Mock the Audio object
        mockAudio = jasmine.createSpyObj('Audio', ['play', 'load']);
        spyOn(window, 'Audio').and.returnValue(mockAudio);
        spyOn(HTMLAudioElement.prototype, 'play').and.callFake(async () => {
            return Promise.resolve();
        });
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call play on the audio object when playAudio is called', () => {
        service.playAudio();
        expect(mockAudio.play).toHaveBeenCalled();
    });
});
