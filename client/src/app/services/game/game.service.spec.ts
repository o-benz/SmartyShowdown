import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let mockChoices: Choice[];
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let mockQuestion: Question;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['isAnswerValid']);
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
            providers: [{ provide: SocketCommunicationService, useValue: socketServiceSpy }],
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

    it('should return the correct value   when called with correct interval', () => {
        expect(service.staysInInterval(3, 2, 1)).toBeTrue();
        expect(service.staysInInterval(1, 2, 3)).toBeFalse();
        expect(service.staysInInterval(3, 2)).toBeTrue();
    });

    it('should return answer if getAnswers is called with a question containing answers', () => {
        const question = {
            type: 'QCM',
            text: 'What is 1 + 1?',
            points: 10,
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
                { text: '3', isCorrect: false },
            ],
        };
        expect(service.getAnswers(question)).toEqual(['2']);
    });

    it('should return nothing when getAnswers is called with question containing no answers', () => {
        const question = {
            type: 'QCM',
            text: 'What is 1 + 1?',
            points: 10,
        };
        expect(service.getAnswers(question)).toEqual([]);
    });

    it('should return if answer is valid if calling isAnswerValid', () => {
        mockChoices = [
            { text: '2', isCorrect: true },
            { text: '4', isCorrect: true },
        ];
        service.currentChoices = mockChoices;
        socketServiceSpy.isAnswerValid.and.returnValue(of(true));
        const questionIndex = 1;
        service.isValidAnswer(questionIndex);
        expect(socketServiceSpy.isAnswerValid).toHaveBeenCalledWith({ answers: service.currentChoices, questionIndex });
    });
});
