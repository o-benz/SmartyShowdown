import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BaseQuestion, Question, TypeEnum } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import { McqHandlerService } from '@app/services/mcq-handler/mcq-handler.service';
import { OeqHandlerService } from '@app/services/oeq-handler/oeq-handler.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let questionOne: BaseQuestion;
    let questionTwo: BaseQuestion;
    let questionThree: BaseQuestion;
    let questionFour: Question;
    let questionFive: Question;
    let quiz: Quiz;
    let httpMock: HttpTestingController;
    let mcqQuestionHandlerSpy: jasmine.SpyObj<McqHandlerService>;
    let oeqQuestionHandlerSpy: jasmine.SpyObj<OeqHandlerService>;

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
        questionThree = {
            type: 'QRL',
            text: 'text',
            points: 10,
        };
        questionFour = {
            _id: '2',
            type: 'QCM',
            text: 'text',
            points: 20,
            date: new Date(),
        };
        questionFive = {
            _id: '3',
            type: 'QRL',
            text: 'text',
            points: 10,
            date: new Date(),
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

        const mcqHandlerSpy = jasmine.createSpyObj('McqHandlerService', [
            'addMultipleChoiceQuestion',
            'deleteMultipleChoiceQuestion',
            'updateMultipleChoiceQuestion',
            'getAllMultipleChoiceQuestions',
        ]);
        const oeqHandlerSpy = jasmine.createSpyObj('OeqHandlerService', [
            'addOpenEndedQuestion',
            'deleteOpenEndedQuestion',
            'updateOpenEndedQuestion',
            'getAllOpenEndedQuestions',
        ]);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [
                QuestionService,
                { provide: McqHandlerService, useValue: mcqHandlerSpy },
                { provide: OeqHandlerService, useValue: oeqHandlerSpy },
            ],
        });
        service = TestBed.inject(QuestionService);
        mcqQuestionHandlerSpy = TestBed.inject(McqHandlerService) as jasmine.SpyObj<McqHandlerService>;
        oeqQuestionHandlerSpy = TestBed.inject(OeqHandlerService) as jasmine.SpyObj<OeqHandlerService>;
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
        service.deleteQuizQuestion(questionOne, quiz);
        expect(quiz.questions).toEqual([questionTwo]);
    });

    it('should check validity', () => {
        service.checkValidity(questionOne).subscribe((valid) => {
            expect(valid).toBeTruthy();
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/quiz/valid/question`);
        expect(req.request.method).toBe('POST');
        req.flush(true);
    });

    it('AddQuestionToBank should call addMultipleChoiceQuestion when question type is QCM', () => {
        service.addQuestionToBank(questionOne);
        expect(mcqQuestionHandlerSpy.addMultipleChoiceQuestion).toHaveBeenCalledWith(questionOne);
        expect(oeqQuestionHandlerSpy.addOpenEndedQuestion).not.toHaveBeenCalled();
    });

    it('AddQuestionToBank should call addOpenEndedQuestion when question type is not QCM', () => {
        service.addQuestionToBank(questionThree);
        expect(oeqQuestionHandlerSpy.addOpenEndedQuestion).toHaveBeenCalledWith(questionThree);
        expect(mcqQuestionHandlerSpy.addMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it('DeleteQuestionFromBank should call deleteMultipleChoiceQuestion when question type is QCM', () => {
        service.deleteQuestionFromBank(questionFour);
        expect(mcqQuestionHandlerSpy.deleteMultipleChoiceQuestion).toHaveBeenCalled();
        expect(oeqQuestionHandlerSpy.deleteOpenEndedQuestion).not.toHaveBeenCalled();
    });

    it('DeleteQuestionFromBank should call deleteOpenEndedQuestion when question type is not QCM', () => {
        service.deleteQuestionFromBank(questionFive);
        expect(oeqQuestionHandlerSpy.deleteOpenEndedQuestion).toHaveBeenCalled();
        expect(mcqQuestionHandlerSpy.deleteMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it('UpdateQuestionInBank should call updateMultipleChoiceQuestion when question type is QCM', () => {
        service.updateQuestionInBank(questionFour);
        expect(mcqQuestionHandlerSpy.updateMultipleChoiceQuestion).toHaveBeenCalled();
        expect(oeqQuestionHandlerSpy.updateOpenEndedQuestion).not.toHaveBeenCalled();
    });

    it('UpdateQuestionInBank should call updateOpenEndedQuestion when question type is not QCM', () => {
        service.updateQuestionInBank(questionFive);
        expect(oeqQuestionHandlerSpy.updateOpenEndedQuestion).toHaveBeenCalled();
        expect(mcqQuestionHandlerSpy.updateMultipleChoiceQuestion).not.toHaveBeenCalled();
    });

    it('GetAllQuestions get all questions', () => {
        const mockQuestionsOne = { ...questionFour, choices: [] };
        const mockQuestionsTwo = { ...questionFive };
        mcqQuestionHandlerSpy.getAllMultipleChoiceQuestions.and.returnValue(of([mockQuestionsOne]));
        oeqQuestionHandlerSpy.getAllOpenEndedQuestions.and.returnValue(of([mockQuestionsTwo]));
        service.getAllQuestions().subscribe((questions) => {
            expect(questions).toEqual([questionTwo, { ...questionThree, choices: undefined }]);
        });
        expect(mcqQuestionHandlerSpy.getAllMultipleChoiceQuestions).toHaveBeenCalled();
    });

    it('GetAllQuestions should transform questions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'fetchAndSortMCQQuestions').and.returnValue(of([questionFour]));
        service.getAllMultipleChoiceQuestions().subscribe((questions) => {
            expect(questions).toEqual([{ ...questionTwo, choices: undefined }]);
        });
    });

    it('getQuestionsByType should return MCQ for QCM', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mcqQuestionHandlerSpy.getAllMultipleChoiceQuestions.and.returnValue(of([questionFour]));
        service.getQuestionsByType(TypeEnum.QCM).subscribe((questions: unknown) => {
            expect(questions).toEqual([questionFour]);
        });
    });

    it('getQuestionsByType should return QRL for QRL', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oeqQuestionHandlerSpy.getAllOpenEndedQuestions.and.returnValue(of([questionFive]));
        service.getQuestionsByType(TypeEnum.QRL).subscribe((questions: unknown) => {
            expect(questions).toEqual([questionFive]);
        });
    });

    it('getQuestionsByType should return all for ALL', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'fetchAndSortAllQuestions').and.returnValue(of([questionFour, questionFive]));
        service.getQuestionsByType(TypeEnum.ALL).subscribe((questions: unknown) => {
            expect(questions).toEqual([questionFour, questionFive]);
        });
    });
});
