import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Question, TypeEnum } from '@app/interfaces/question-model';
import { environment } from 'src/environments/environment';
import { OeqHandlerService } from './oeq-handler.service';

/* eslint-disable no-underscore-dangle */
// _id is a MongoDB property, so it is not a problem to use it
describe('OeqHandlerService', () => {
    let service: OeqHandlerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OeqHandlerService],
        });
        service = TestBed.inject(OeqHandlerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all multiple choice questions', () => {
        const mockMCQs = [generateMockOEQ(), generateMockOEQ()] as Question[];

        service.getAllOpenEndedQuestions().subscribe((questions) => {
            const expectedQuestions = [
                {
                    type: mockMCQs[0].type,
                    text: mockMCQs[0].text,
                    points: mockMCQs[0].points,
                    _id: mockMCQs[0]._id,
                    date: mockMCQs[0].date,
                } as Question,
                {
                    type: mockMCQs[1].type,
                    text: mockMCQs[1].text,
                    points: mockMCQs[1].points,
                    _id: mockMCQs[1]._id,
                    date: mockMCQs[1].date,
                } as Question,
            ];
            expect(questions.length).toBe(expectedQuestions.length);
            for (let i = 0; i < questions.length; i++) {
                expect(questions[i]._id).toEqual(expectedQuestions[i]._id);
            }
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/question-oeq/`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMCQs);
    });

    it('should get a multiple choice question by id', () => {
        const mockOEQ = generateMockOEQ();

        service.getOpenEndedQuestionById(mockOEQ._id).subscribe((question) => {
            expect(question).toEqual(mockOEQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/${mockOEQ._id}`);
        expect(request.request.method).toBe('GET');
        request.flush(mockOEQ);
    });

    it('should add a multiple choice question', () => {
        const mockOEQ = generateMockOEQ();

        service.addOpenEndedQuestion(mockOEQ).subscribe((question) => {
            expect(question).toEqual(mockOEQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/`);
        expect(request.request.method).toBe('POST');
        request.flush(mockOEQ);
    });

    it('should delete a multiple choice question', () => {
        const mockMCQ = generateMockOEQ();

        service.deleteOpenEndedQuestion(mockMCQ._id).subscribe(() => {
            expect().nothing();
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/${mockMCQ._id}`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('should update a multiple choice question', () => {
        const mockMCQ = generateMockOEQ();

        service.updateOpenEndedQuestion(mockMCQ).subscribe((question) => {
            expect(question).toEqual(mockMCQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/`);
        expect(request.request.method).toBe('PATCH');
        request.flush(mockMCQ);
    });

    it('should get multiple choice question points', () => {
        const mockOEQ = generateMockOEQ();

        service.getOpenEndedQuestionPoints(mockOEQ._id).subscribe((response) => {
            expect(response).toEqual(mockOEQ.points);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/${mockOEQ._id}/points`);
        expect(request.request.method).toBe('GET');
        request.flush(mockOEQ.points);
    });

    it('should get multiple choice question type', () => {
        const mockMCQ = generateMockOEQ();

        service.getOpenEndedQuestionType(mockMCQ._id).subscribe((response) => {
            expect(response).toEqual(mockMCQ.type);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/${mockMCQ._id}/type`);
        expect(request.request.method).toBe('GET');
        request.flush(mockMCQ.type);
    });

    it('should get multiple choice question date', () => {
        const mockOEQ = generateMockOEQ();

        service.getOpenEndedQuestionDate(mockOEQ._id).subscribe((response) => {
            expect(response).toEqual(mockOEQ.date);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-oeq/${mockOEQ._id}/date`);
        expect(request.request.method).toBe('GET');
        request.flush(mockOEQ.date);
    });
});

const generateMockOEQ = (): Question => {
    return {
        type: TypeEnum.QRL,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: getRandomId(),
    };
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const MILLIS_IN_SECOND = 1000;
const HEX_BASE = 16;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
const getRandomId = (): string => Math.floor(Date.now() / MILLIS_IN_SECOND).toString(HEX_BASE);
