import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { environment } from 'src/environments/environment';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let mockChoices: Choice[];
    let mockQuestion: Question;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        mockQuestion = {
            type: 'QCM',
            text: 'What is 1 + 1?',
            points: 10,
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
                { text: '3', isCorrect: false },
                { text: '4', isCorrect: true },
            ],
        };
        mockChoices = [];
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true if all true choices were posted', () => {
        mockChoices = [
            { text: '2', isCorrect: true },
            { text: '4', isCorrect: true },
        ];
        service.currentChoices = mockChoices;
        const expectedResponse = true;

        service.postCurrentChoices(mockQuestion.text).subscribe((response) => {
            expect(response).toEqual(expectedResponse);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/game/correct`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedResponse);
    });
});
