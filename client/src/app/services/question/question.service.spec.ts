import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Choice, Question, Quiz, QuizComponentEnum } from '@app/interfaces/quiz-model';
import { environment } from 'src/environments/environment';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let questionOne: Question;
    let questionTwo: Question;
    let quiz: Quiz;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        questionOne = {
            type: 'QCM',
            text: 'text',
            points: 10,
            choices: [],
        };
        questionTwo = {
            type: 'QCM',
            text: 'text',
            points: 20,
            choices: [],
        };
        quiz = {
            id: '1',
            title: 'title',
            visible: true,
            description: 'description',
            duration: 10,
            lastModification: '',
            questions: [questionOne, questionTwo],
        };

        TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
        });
        service = TestBed.inject(QuestionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should place higher', () => {
        service.placeHigher(questionTwo, quiz);
        expect(quiz.questions[0]).toEqual(questionTwo);
    });

    it('should place lower', () => {
        service.placeLower(questionOne, quiz);
        expect(quiz.questions[1]).toEqual(questionOne);
    });

    it('should delete question', () => {
        service.deleteQuestion(questionOne, quiz);
        expect(quiz.questions).toEqual([questionTwo]);
    });

    it('should add multiple choice', () => {
        const choice = {} as Choice;
        choice.text = 'text';
        choice.isCorrect = true;

        const choice2 = {} as Choice;
        choice2.text = 'text';
        choice.isCorrect = false;

        service.addMultipleChoice(choice, questionOne);
        service.addMultipleChoice(choice2, questionOne);
        expect(questionOne.choices).toEqual([choice, choice2]);
    });

    it('should not add multiple choice', () => {
        const choice = {} as Choice;
        choice.text = '';
        service.addMultipleChoice(choice, questionOne);
        expect(questionOne.choices).toEqual([]);
    });

    it('should not add mulitple choice if question is falsy', () => {
        const choice = {} as Choice;
        choice.text = 'text';
        service.addMultipleChoice(choice, {} as Question);
        expect(questionOne.choices).toEqual([]);
    });

    it('should not add mulitple choice if there is more than 4 choice', () => {
        const choice = {} as Choice;
        choice.text = 'text';
        questionOne.choices = [{} as Choice, {} as Choice, {} as Choice, {} as Choice];
        service.addMultipleChoice(choice, questionOne);
        expect(questionOne.choices.length).toEqual(QuizComponentEnum.MAXCHOICES);
    });

    it('should correctly map the response to Question format', () => {
        const mockResponse = [
            { type: 'Type1', question: 'Question1', points: 10, choices: [{} as Choice, {} as Choice], date: '2021-01-01' },
            { type: 'Type2', question: 'Question2', points: 20, choices: [{} as Choice, {} as Choice], date: '2022-01-01' },
        ];

        service.getAllQuestions().subscribe((questions) => {
            const expectedQuestions = [
                { type: 'Type2', text: 'Question2', points: 20, choices: [{} as Choice, {} as Choice] },
                { type: 'Type1', text: 'Question1', points: 10, choices: [{} as Choice, {} as Choice] },
            ];
            expect(questions).toEqual(expectedQuestions);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/question-mcq/`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should check validity', () => {
        service.checkValidity(questionOne).subscribe((valid) => {
            expect(valid).toBeTruthy();
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/quiz/valid/question`);
        expect(req.request.method).toBe('POST');
        req.flush(true);
    });

    it('should add question to bank', () => {
        service.addQuestionToBank(questionOne).subscribe((response) => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/question-mcq/`);
        expect(req.request.method).toBe('POST');
        req.flush(true);
    });

    afterEach(() => {
        httpMock.verify();
    });
});
