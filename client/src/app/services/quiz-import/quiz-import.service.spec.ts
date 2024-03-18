import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizAddService } from '@app/services/quiz-add/quiz-add.service';
import { JsonQuizCheckService } from '@app/services/quiz-check/json-quiz-check.service';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';
import { QuizImportService } from './quiz-import.service';

describe('QuizImportService', () => {
    let service: QuizImportService;
    let mockQuizAddService: jasmine.SpyObj<QuizAddService>;
    let mockJsonCheckService: jasmine.SpyObj<JsonQuizCheckService>;
    let mockQuizValueCheckService: jasmine.SpyObj<QuizValueCheckService>;
    let mockGames: jasmine.SpyObj<Quiz[]>;
    let checkSpy: jasmine.SpyObj<QuizValueCheckService>;

    beforeEach(() => {
        mockQuizAddService = jasmine.createSpyObj('QuizAddService', ['addToQuizList']);
        mockJsonCheckService = jasmine.createSpyObj('JsonQuizCheckService', ['handleErrorMessage', 'isNameAvailable', 'nameCheck']);
        mockQuizValueCheckService = jasmine.createSpyObj('QuizValueCheckService', ['checkQuiz', 'isValidQuiz', 'getMessage']);
        const mockSanitizedQuiz = generateQuiz('000001', 'first');
        checkSpy = {
            ...jasmine.createSpyObj('QuizValueCheckService', ['checkQuiz', 'getResult', 'isValidQuiz', 'getMessage', 'sanitizedQuiz']),
            get sanitizedQuiz() {
                return mockSanitizedQuiz;
            },
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                QuizImportService,
                { provide: QuizAddService, useValue: mockQuizAddService },
                { provide: JsonQuizCheckService, useValue: mockJsonCheckService },
                { provide: QuizValueCheckService, useValue: mockQuizValueCheckService },
                { provide: QuizValueCheckService, useValue: checkSpy },
            ],
        });
        checkSpy = TestBed.inject(QuizValueCheckService) as jasmine.SpyObj<QuizValueCheckService>;
        service = TestBed.inject(QuizImportService);
        mockGames = [generateQuiz('000001', 'first'), generateQuiz('000002', 'second'), generateQuiz('000003', 'third')];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('readQuizFromFile should return a quiz when import is sucessful', async () => {
        const file = new File([JSON.stringify(mockGames[0])], 'testQuiz.json', { type: 'application/json' });
        const result = service['readQuizFromFile'](file);
        await expectAsync(result).toBeResolvedTo(mockGames[0]);
    });

    it('readQuizFromFile should call handleError when file is empty', async () => {
        const file = new File([], 'testQuiz.json', { type: 'application/json' });
        await service['readQuizFromFile'](file);
        expect(mockJsonCheckService.handleErrorMessage).toHaveBeenCalled();
    });

    it('readQuizFromFile should call handleError when file is not json', async () => {
        const file = new File(['texte'], 'testQuiz.txt', { type: 'txt' });
        await service['readQuizFromFile'](file);
        expect(mockJsonCheckService.handleErrorMessage).toHaveBeenCalled();
    });

    it('importQuiz should call handle error with checker message when tests fails', async () => {
        const file = new File([JSON.stringify(mockGames[0])], 'testQuiz.json', { type: 'application/json' });
        checkSpy.isValidQuiz.and.returnValue(false);
        checkSpy.getMessage.and.returnValue('message');

        await service.importQuiz(file);

        expect(mockJsonCheckService.handleErrorMessage).toHaveBeenCalledWith('message');
    });

    it('importQuiz should call nameCheck if a quiz with this name already exists', async () => {
        const file = new File([JSON.stringify(mockGames[0])], 'testQuiz.json', { type: 'application/json' });
        checkSpy.isValidQuiz.and.returnValue(true);
        mockJsonCheckService.isNameAvailable.and.returnValue(false);
        mockJsonCheckService.nameCheck.and.callFake(async () => Promise.resolve('newQuizName'));
        spyOnProperty(checkSpy, 'sanitizedQuiz', 'get').and.returnValue(mockGames[0]);

        await service.importQuiz(file);

        expect(mockJsonCheckService.nameCheck).toHaveBeenCalled();
    });

    it('importQuiz should call addToQuizList if a quiz passes all tests', async () => {
        const file = new File([JSON.stringify(mockGames[0])], 'testQuiz.json', { type: 'application/json' });
        mockQuizAddService.addToQuizList.and.callFake(async () => Promise.resolve());
        checkSpy.isValidQuiz.and.returnValue(true);
        mockJsonCheckService.isNameAvailable.and.returnValue(true);
        spyOnProperty(checkSpy, 'sanitizedQuiz', 'get').and.returnValue(mockGames[0]);
        await service.importQuiz(file);

        expect(mockQuizAddService.addToQuizList).toHaveBeenCalledWith(mockGames[0]);
    });

    it('importQuiz should send an error message if readQuizFromFile Fails', async () => {
        const file = new File([JSON.stringify(mockGames[0])], 'testQuiz.json', { type: 'application/json' });
        checkSpy.isValidQuiz.and.returnValue(true);
        mockJsonCheckService.isNameAvailable.and.returnValue(false);
        mockJsonCheckService.nameCheck.and.callFake(async () => Promise.resolve(false));
        spyOnProperty(checkSpy, 'sanitizedQuiz', 'get').and.returnValue(mockGames[0]);

        await service.importQuiz(file);
        expect(mockJsonCheckService.handleErrorMessage).toHaveBeenCalled();
    });
});

const HALF = 0.5;
const MAX_POINTS = 100;

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
};

const generateQuiz = (id: string, title: string): Quiz => {
    return {
        id,
        visible: Math.random() < HALF,
        title,
        description: 'Random description',
        duration: getRandomInt(MAX_POINTS),
        lastModification: new Date().toISOString(),
        questions: [
            {
                type: 'QCM',
                text: 'Random question',
                points: getRandomInt(MAX_POINTS),
                choices: [
                    {
                        text: 'Choice 1',
                        isCorrect: Math.random() < HALF,
                    },
                    {
                        text: 'Choice 2',
                        isCorrect: Math.random() < HALF,
                    },
                ],
            },
            {
                type: 'QRL',
                text: 'Random question',
                points: getRandomInt(MAX_POINTS),
            },
        ],
    };
};
