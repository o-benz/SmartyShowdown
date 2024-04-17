import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BaseQuestion } from '@app/interfaces/question-model';
import { games } from '@app/interfaces/quiz';
import { Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { LENGTH_ID } from '@app/services/constants';
import { QuestionService } from '@app/services/question/question.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
    let service: QuizService;
    let mockQuizList: Quiz[] = games;
    let mockQuiz: Quiz;
    let httpTestingController: HttpTestingController;
    let questionSpyService: jasmine.SpyObj<QuestionService>;

    beforeEach(() => {
        mockQuiz = {
            id: '123',
            visible: true,
            title: 'title',
            description: 'description',
            duration: 10,
            lastModification: '',
            questions: [],
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: QuestionService, useValue: jasmine.createSpyObj('QuestionService', ['getAllMultipleChoiceQuestions']) }],
        });

        mockQuizList = [];
        httpTestingController = TestBed.inject(HttpTestingController);
        questionSpyService = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;
        service = TestBed.inject(QuizService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch questions and call the callback with questions', (done) => {
        const callback = jasmine.createSpy('callback');
        questionSpyService.getAllMultipleChoiceQuestions.and.returnValue(of(games[0].questions));
        service['fetchQuestions'](callback);

        setTimeout(() => {
            expect(callback).toHaveBeenCalledWith(games[0].questions);
            done();
        });
    });

    it('should get all quiz', () => {
        service.getAllQuiz().subscribe((quizzes) => {
            expect(quizzes).toEqual(mockQuizList);
        });
        const req = httpTestingController.expectOne(`${environment.serverUrl}/quiz`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuizList);
    });

    it('should not generate random quiz', fakeAsync(async () => {
        const spy = spyOn(service, 'generateRandomQuiz').and.callThrough();
        questionSpyService.getAllMultipleChoiceQuestions.and.returnValue(of(games[0].questions));
        const result = await service.generateRandomQuiz();
        tick();

        expect(spy).toHaveBeenCalled();
        expect(result.title).toBe(QuizEnum.RANDOMMODE);
    }));

    it('should generate random ID', () => {
        const id = service.generateRandomID(LENGTH_ID);
        expect(id.length).toBe(LENGTH_ID);
    });

    it('getQuizById should return a Quiz', () => {
        const mockId = '123';

        service.getQuizById(mockId).subscribe((quiz) => {
            expect(quiz).toEqual(mockQuiz);
        });

        const req = httpTestingController.expectOne(`${environment.serverUrl}/quiz/${mockId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuiz);
    });

    it('addQuiz should return success status', () => {
        const mockResponse = true;

        service.addQuiz(mockQuiz).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpTestingController.expectOne(`${environment.serverUrl}/quiz`);
        expect(req.request.method).toEqual('POST');
        req.flush(mockResponse);
    });

    it('should generate a random quiz', async () => {
        const dummyQuestions = games[0].questions;

        spyOn(service, 'generateQuestions').and.returnValue(Promise.resolve(dummyQuestions));
        spyOn(service, 'generateRandomID').and.returnValue('randomId');

        const quiz = await service.generateRandomQuiz();

        expect(quiz.id).toBe('randomId');
        expect(quiz.questions).toEqual(dummyQuestions);
    });

    it('should add a quiz to the list', () => {
        mockQuizList = [mockQuiz];
        const newQuiz = { ...mockQuiz, id: '456' };
        const newQuizList = service.addQuizToList(newQuiz, mockQuizList);

        expect(newQuizList[0]).toEqual(newQuiz);
        expect(newQuizList[1]).toEqual(mockQuiz);
        expect(newQuizList.length).toBe(2);
    });

    it('should generate questions', async () => {
        const dummyQuestions = games[0].questions;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'fetchQuestions').and.callFake((callback: (arg0: BaseQuestion[]) => any) => callback(dummyQuestions));

        const questions = await service.generateQuestions();

        expect(questions).toEqual(dummyQuestions);
    });

    it('should handle failure in generating questions', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'fetchQuestions').and.callFake((callback: (arg0: BaseQuestion[]) => void) => callback([]));
        try {
            await service.generateQuestions();
            fail('generateQuestions should have thrown an error');
        } catch (error) {
            expect(error).toBe('Failed to fetch questions');
        }
    });

    it('should handle failure in generateRandomQuiz', async () => {
        spyOn(service, 'generateQuestions').and.returnValue(Promise.reject('Failed to generate questions'));

        try {
            await service.generateRandomQuiz();
            fail('generateRandomQuiz should have thrown an error');
        } catch (error) {
            expect(error).toBe('Failed to generate questions');
        }
    });
});
