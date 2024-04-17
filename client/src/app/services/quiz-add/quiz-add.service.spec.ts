import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz-model';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { QuizAddService } from './quiz-add.service';

describe('QuizAddService', () => {
    let service: QuizAddService;
    let mockQuizService: jasmine.SpyObj<QuizService>;
    let mockJsonCheckService: jasmine.SpyObj<JsonQuizCheckService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(() => {
        mockQuizService = jasmine.createSpyObj('QuizService', ['addQuiz']);
        mockJsonCheckService = jasmine.createSpyObj('JsonQuizCheckService', ['handleErrorMessage']);
        mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);

        TestBed.configureTestingModule({
            providers: [
                QuizAddService,
                { provide: QuizService, useValue: mockQuizService },
                { provide: JsonQuizCheckService, useValue: mockJsonCheckService },
                { provide: Router, useValue: mockRouter },
            ],
        });
        service = TestBed.inject(QuizAddService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add quiz to list call for reload page', () => {
        const quiz: Quiz = {
            id: '000004',
            title: 'forth',
            questions: [],
        } as unknown as Quiz;
        mockQuizService.addQuiz.and.returnValue(of(true));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'stealthPageReload');

        service.addToQuizList(quiz);

        expect(mockQuizService.addQuiz).toHaveBeenCalledWith(quiz);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle error when adding quiz fails', () => {
        const quiz: Quiz = {
            id: '000004',
            title: 'forth',
            questions: [],
        } as unknown as Quiz;
        mockQuizService.addQuiz.and.returnValue(throwError(() => 'error'));

        service.addToQuizList(quiz);

        expect(mockQuizService.addQuiz).toHaveBeenCalledWith(quiz);
        expect(mockJsonCheckService.handleErrorMessage).toHaveBeenCalledWith("Erreur lors de l'ajout du quiz au database");
    });

    it('stealthPageReload should navigate to admin page', async () => {
        mockRouter.navigateByUrl.and.resolveTo(true);
        service['stealthPageReload']().then(() => {
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/', { skipLocationChange: true });
        });
    });
});
