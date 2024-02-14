import { Choice, Question } from '@app/model/quiz/quiz.schema';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;

    beforeEach(() => {
        gameService = new GameService();
    });

    describe('correctQuiz', () => {
        it('should return false if question is undefined', async () => {
            const choices: Choice[] = [{ text: 'Choice 1' }];
            const question: Question | undefined = undefined;
            const result = await gameService.correctQuiz(choices, question);
            expect(result).toBe(false);
        });

        it('should return false if number of choices does not match number of correct choices', async () => {
            const choices: Choice[] = [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: true },
            ];
            const question: Question = {
                type: 'QCM',
                text: 'Question Text',
                points: 1,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: true },
                    { text: 'Choice 3', isCorrect: true },
                ],
            };
            const result = await gameService.correctQuiz(choices, question);
            expect(result).toBe(false);
        });

        it('should return false if choices do not match correct choices', async () => {
            const choices: Choice[] = [
                { text: 'Choice 3', isCorrect: false },
                { text: 'Choice 4', isCorrect: false },
            ];
            const question: Question = {
                type: 'QCM',
                text: 'Question Text',
                points: 1,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: true },
                ],
            };
            const result = await gameService.correctQuiz(choices, question);
            expect(result).toBe(false);
        });

        it('should return true if choices match correct choices', async () => {
            const choices: Choice[] = [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: true },
            ];
            const question: Question = {
                type: 'QCM',
                text: 'Question Text',
                points: 1,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: true },
                ],
            };
            const result = await gameService.correctQuiz(choices, question);
            expect(result).toBe(true);
        });

        it('should return true if there are no correct choices and no choices given', async () => {
            const choices: Choice[] = [];
            const question: Question = { type: 'QCM', text: 'Question Text', points: 1 };
            const result = await gameService.correctQuiz(choices, question);
            expect(result).toBe(true);
        });
    });
});
