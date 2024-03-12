import { CorrectionData } from '@app/model/quiz/quiz.schema';
import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

const mockGameService = {
    correctQuiz: jest.fn(),
};

describe('GameController', () => {
    let controller: GameController;
    // eslint-disable-next-line no-unused-vars
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: mockGameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
        service = module.get<GameService>(GameService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('correct', () => {
        it('should call correctQuiz method with correct parameters', async () => {
            const correctionData: CorrectionData = {
                clientAnswers: [{ text: 'Answer 1', isCorrect: true }],
                questionText: 'Sample Question',
                quizId: 'quiz123',
            };

            const expectedResult = true;
            mockGameService.correctQuiz.mockResolvedValue(expectedResult);

            const result = await controller.correct(correctionData);

            expect(result).toBe(expectedResult);
            expect(mockGameService.correctQuiz).toHaveBeenCalledWith(
                correctionData.clientAnswers,
                correctionData.questionText,
                correctionData.quizId,
            );
        });

        it('should handle exceptions from correctQuiz method', async () => {
            const correctionData: CorrectionData = {
                clientAnswers: [{ text: 'Answer 2', isCorrect: false }],
                questionText: 'Sample Question',
                quizId: 'quiz123',
            };

            mockGameService.correctQuiz.mockRejectedValue(new Error('Mock error'));

            await expect(controller.correct(correctionData)).rejects.toThrow('Mock error');
        });
    });
});
