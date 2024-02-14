import { GameService } from '@app/services/game/game.service';
import { GameController } from './game.controller';

describe('GameController', () => {
    let gameController: GameController;
    let gameService: GameService;

    beforeEach(() => {
        gameService = {
            correctQuiz: jest.fn(),
        } as unknown as GameService;

        gameController = new GameController(gameService);
    });

    it('correct method should handle correct requests', async () => {
        const mockRequestBody = {
            choices: [{ text: 'Choice 1', isCorrect: true }],
            question: { type: 'QCM', text: 'Question 1', points: 1, choices: [{ text: 'Choice 1', isCorrect: true }] },
        };
        const expectedResult = true;
        (gameService.correctQuiz as jest.Mock).mockResolvedValueOnce(expectedResult);

        const result = await gameController.correct(mockRequestBody);

        expect(result).toEqual(expectedResult);
        expect(gameService.correctQuiz).toHaveBeenCalledWith(mockRequestBody.choices, mockRequestBody.question);
    });
});
