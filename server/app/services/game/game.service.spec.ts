import { Choice, Quiz } from '@app/model/quiz/quiz.schema';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('GameService', () => {
    let gameService: GameService;
    let quizService: QuizService;
    let mockQuizService: jest.Mocked<QuizService>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: QuizService,
                    useValue: {
                        // eslint-disable-next-line no-unused-vars
                        getQuizById: jest.fn().mockImplementation(async (id: string) => Promise.resolve({})),
                    },
                },
            ],
        }).compile();
        gameService = module.get<GameService>(GameService);
        quizService = module.get<QuizService>(QuizService);
        mockQuizService = module.get<QuizService>(QuizService) as jest.Mocked<QuizService>;
        // eslint-disable-next-line no-unused-vars
        jest.spyOn(quizService, 'getQuizById').mockImplementation(async (id: string) =>
            Promise.resolve({
                id: '1a2b3d',
                visible: true,
                title: 'Questionnaire sur le JS 1',
                description: 'Questions de pratique sur le langage JavaScript',
                duration: 60,
                lastModification: '2018-11-13T20:20:39+00:00',
                questions: [
                    {
                        type: 'QCM',
                        text: 'Question Text',
                        points: 1,
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: true },
                            { text: 'Choice 3', isCorrect: true },
                        ],
                    },
                    {
                        type: 'QCM',
                        text: 'Question Text2',
                        points: 1,
                        choices: [
                            { text: 'Choice 1', isCorrect: false },
                            { text: 'Choice 2', isCorrect: true },
                            { text: 'Choice 3', isCorrect: true },
                        ],
                    },
                    {
                        type: 'QCM',
                        text: 'Question Text3',
                        points: 1,
                    },
                ],
            } as Quiz),
        );
    });

    it('should return false if number of choices does not match number of correct choices', async () => {
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: true },
            { text: 'Choice 4', isCorrect: false },
        ];
        const result = await gameService.correctQuiz(choices, 'Question Text', '1a2b3d');
        expect(mockQuizService.getQuizById).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should return false if choices do not match correct choices', async () => {
        const choices: Choice[] = [
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 4', isCorrect: false },
        ];
        const result = await gameService.correctQuiz(choices, 'Question Text', '1a2b3d');
        expect(mockQuizService.getQuizById).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should return true if choices match correct choices', async () => {
        const choices: Choice[] = [
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: true },
        ];
        const result = await gameService.correctQuiz(choices, 'Question Text2', '1a2b3d');
        expect(mockQuizService.getQuizById).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should return false if there is a false choice', async () => {
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        const result = await gameService.correctQuiz(choices, 'Question Text2', '1a2b3d');
        expect(mockQuizService.getQuizById).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should return true if both question choices and the client answers are empty', async () => {
        const choices: Choice[] = [];
        const result = await gameService.correctQuiz(choices, 'Question Text3', '1a2b3d');
        expect(mockQuizService.getQuizById).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should return false if question text is undefined', async () => {
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        const result = await gameService.correctQuiz(choices, undefined, '1a2b3d');
        expect(result).toBe(false);
    });

    it('should return false if QuizId is undefined', async () => {
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        const result = await gameService.correctQuiz(choices, 'Question Text2', undefined);
        expect(result).toBe(false);
    });
});
