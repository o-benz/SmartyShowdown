import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { games } from '@app/interfaces/quiz';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { LENGTH_ID, MIN_QUIZ_AMOUNT } from '@app/services/constants';
import { environment } from 'src/environments/environment';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
    let service: QuizService;
    let mockQuizList: Quiz[] = games;
    let mockQuiz: Quiz;
    let httpTestingController: HttpTestingController;

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
        });

        mockQuizList = [];
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(QuizService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all quiz', () => {
        service.getAllQuiz().subscribe((quizzes) => {
            expect(quizzes).toEqual(mockQuizList);
        });
        const req = httpTestingController.expectOne(`${environment.serverUrl}/quiz`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuizList);
    });

    it('should not generate random quiz', fakeAsync(() => {
        const spy = spyOn(service, 'generateRandomQuiz').and.callThrough();
        const result = service.generateRandomQuiz(mockQuizList);
        tick();

        expect(spy).toHaveBeenCalled();
        expect(result.some((quiz) => quiz.title === QuizEnum.RANDOMMODE)).toBeFalse();
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

    it('should not generate random question if it already exists', fakeAsync(() => {
        const quizRandom: Quiz = {
            id: '123',
            visible: true,
            title: QuizEnum.RANDOMMODE,
            description: QuizEnum.RANDOMDESCRIPTION,
            duration: 10,
            lastModification: '',
            questions: [],
        };
        const newQuizList = [quizRandom];
        service.generateRandomQuiz(newQuizList).some((quiz) => quiz.title === QuizEnum.RANDOMMODE);
        tick();
        expect(newQuizList.length).toBe(1);
    }));

    it('generateRandomQuiz creates a new quiz when there are enough questions', async () => {
        const mockQuestions = new Array(MIN_QUIZ_AMOUNT);

        spyOn(service, 'fetchQuestions').and.callFake((callback: (questions: Question[]) => void) => {
            callback(mockQuestions);
        });

        await service.generateRandomQuiz(mockQuizList);
        expect(service.fetchQuestions).toHaveBeenCalled();
    });

    it('generateRandomQuiz should not creates a new quiz when there are not enough questions', async () => {
        const mockQuestions = new Array(MIN_QUIZ_AMOUNT - 1);

        spyOn(service, 'fetchQuestions').and.callFake((callback: (questions: Question[]) => void) => {
            callback(mockQuestions);
        });

        await service.generateRandomQuiz(mockQuizList);
        expect(service.fetchQuestions).toHaveBeenCalled();
    });
});
