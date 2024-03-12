import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Choice, MultipleChoiceQuestion, TypeEnum } from '@app/interfaces/question-model';
import { Types } from 'mongoose';
import { environment } from 'src/environments/environment';
import { AdminQuestionHandlerService } from './mcq-handler.service';

/* eslint-disable no-underscore-dangle */
describe('AdminQuestionHandlerService', () => {
    let service: AdminQuestionHandlerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AdminQuestionHandlerService],
        });
        service = TestBed.inject(AdminQuestionHandlerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all multiple choice questions', () => {
        const mockMCQs = [generateMockMCQ(), generateMockMCQ()] as MultipleChoiceQuestion[];

        service.getAllMultipleChoiceQuestions().subscribe((questions) => {
            const expectedQuestions = [
                {
                    type: mockMCQs[0].type,
                    text: mockMCQs[0].text,
                    points: mockMCQs[0].points,
                    choices: mockMCQs[0].choices,
                    _id: mockMCQs[0]._id,
                    date: mockMCQs[0].date,
                } as MultipleChoiceQuestion,
                {
                    type: mockMCQs[1].type,
                    text: mockMCQs[1].text,
                    points: mockMCQs[1].points,
                    choices: mockMCQs[1].choices,
                    _id: mockMCQs[1]._id,
                    date: mockMCQs[1].date,
                } as MultipleChoiceQuestion,
            ];
            expect(questions.length).toBe(expectedQuestions.length);
            for (let i = 0; i < questions.length; i++) {
                expect(questions[i]._id).toEqual(expectedQuestions[i]._id);
                expect(questions[i].choices).toEqual(expectedQuestions[i].choices);
            }
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/question-mcq/`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMCQs);
    });

    it('should get a multiple choice question by id', () => {
        const mockMCQ = generateMockMCQ();

        service.getMultipleChoiceQuestionById(mockMCQ._id).subscribe((question) => {
            expect(question).toEqual(mockMCQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}`);
        expect(request.request.method).toBe('GET');
        request.flush(mockMCQ);
    });

    it('should add a multiple choice question', () => {
        const mockMCQ = generateMockMCQ();

        service.addMultipleChoiceQuestion(mockMCQ).subscribe((question) => {
            expect(question).toEqual(mockMCQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/`);
        expect(request.request.method).toBe('POST');
        request.flush(mockMCQ);
    });

    it('should delete a multiple choice question', () => {
        const mockMCQ = generateMockMCQ();

        service.deleteMultipleChoiceQuestion(mockMCQ._id).subscribe(() => {
            expect().nothing();
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('should update a multiple choice question', () => {
        const mockMCQ = generateMockMCQ();

        service.updateMultipleChoiceQuestion(mockMCQ).subscribe((question) => {
            expect(question).toEqual(mockMCQ);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/`);
        expect(request.request.method).toBe('PATCH');
        request.flush(mockMCQ);
    });

    it('should get multiple choice question choices', () => {
        const mockMCQ = generateMockMCQ();
        const choices = mockMCQ.choices ? mockMCQ.choices.map((choice) => choice.text) : [];

        service.getMultipleChoiceQuestionChoices(mockMCQ._id).subscribe((response) => {
            expect(response).toEqual(choices);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}/choices`);
        expect(request.request.method).toBe('GET');
        request.flush(choices);
    });

    it('should get multiple choice question points', () => {
        const mockMCQ = generateMockMCQ();

        service.getMultipleChoiceQuestionPoints(mockMCQ._id).subscribe((response) => {
            expect(response).toEqual(mockMCQ.points);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}/points`);
        expect(request.request.method).toBe('GET');
        request.flush(mockMCQ.points);
    });

    it('should get multiple choice question type', () => {
        const mockMCQ = generateMockMCQ();

        service.getMultipleChoiceQuestionType(mockMCQ._id).subscribe((response) => {
            expect(response).toEqual(mockMCQ.type);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}/type`);
        expect(request.request.method).toBe('GET');
        request.flush(mockMCQ.type);
    });

    it('should get multiple choice question date', () => {
        const mockMCQ = generateMockMCQ();

        service.getMultipleChoiceQuestionDate(mockMCQ._id).subscribe((response) => {
            expect(response).toEqual(mockMCQ.date);
        });

        const request = httpMock.expectOne(`${environment.serverUrl}/question-mcq/${mockMCQ._id}/date`);
        expect(request.request.method).toBe('GET');
        request.flush(mockMCQ.date);
    });
});

const generateMockMCQ = (): MultipleChoiceQuestion => {
    return {
        type: TypeEnum.QCM,
        text: getRandomString(),
        points: getRandomNumber(),
        date: new Date(),
        _id: new Types.ObjectId(),
        choices: generateChoices(1),
    };
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const PROBABILITY = 0.5;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
const getRandomChoice = (): Choice => ({
    text: getRandomString(),
    isCorrect: Math.random() > PROBABILITY,
});
const generateChoices = (n: number): Choice[] => {
    const choices = [];
    for (let i = 0; i < n; i++) {
        choices.push(getRandomChoice());
    }
    return choices;
};
