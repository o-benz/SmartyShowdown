import { Quiz } from '@app/model/quiz/quiz.schema';
import { FileManagerService } from '@app/services/file-manager/file-manager.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';

describe('QuizController', () => {
    let controller: QuizController;
    let quizService: QuizService;

    beforeEach(async () => {
        const quizServiceMock = {
            getAllQuiz: jest.fn(),
            getQuizById: jest.fn(),
            updateQuizVisibility: jest.fn(),
            deleteQuiz: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizController],
            providers: [{ provide: QuizService, useValue: quizServiceMock }, FileManagerService],
        }).compile();

        controller = module.get<QuizController>(QuizController);
        quizService = module.get<QuizService>(QuizService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('get allQuiz', () => {
        it('should return an array of quizzes', async () => {
            const result: Quiz[] = [];
            jest.spyOn(quizService, 'getAllQuiz').mockImplementation(async () => result);

            expect(await controller.allQuiz()).toBe(result);
        });
    });

    describe('getQuizById', () => {
        it('should return a quiz if it exists', async () => {
            const quiz: Quiz = {
                id: '1a2b3d',
                visible: true,
                title: 'Questionnaire sur le JS 1',
                description: 'Questions de pratique sur le langage JavaScript',
                duration: 60,
                lastModification: '2018-11-13T20:20:39+00:00',
                questions: [],
            };
            jest.spyOn(quizService, 'getQuizById').mockResolvedValue(quiz);

            expect(await controller.getQuizById('1a2b3d')).toBe(quiz);
        });

        it('should throw NotFoundException if a quiz does not exist', async () => {
            jest.spyOn(quizService, 'getQuizById').mockResolvedValue(null);

            await expect(controller.getQuizById('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateQuiz', () => {
        it('should update quiz visibility and return the updated quiz', async () => {
            const quizId = '1a2b3c';
            const updatedQuiz: Quiz = {
                id: quizId,
                visible: false,
                title: 'Quiz Title',
                description: 'Quiz Description',
                duration: 30,
                lastModification: new Date().toISOString(),
                questions: [],
            };

            jest.spyOn(quizService, 'getQuizById').mockResolvedValue(updatedQuiz);
            jest.spyOn(quizService, 'updateQuizVisibility').mockResolvedValue(updatedQuiz);

            expect(await controller.updateQuiz(quizId)).toBe(updatedQuiz);
        });

        it('should throw NotFoundException if the quiz does not exist', async () => {
            const quizId = 'nonexistent';

            jest.spyOn(quizService, 'getQuizById').mockResolvedValue(null);

            await expect(controller.updateQuiz(quizId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteQuiz', () => {
        it('should delete the quiz and return success message', async () => {
            const quizId = '1a2b3c';

            jest.spyOn(quizService, 'getQuizById').mockResolvedValueOnce({} as Quiz);
            jest.spyOn(quizService, 'deleteQuiz').mockResolvedValueOnce();

            const result = await controller.deleteQuiz(quizId);

            expect(quizService.getQuizById).toHaveBeenCalledWith(quizId);
            expect(quizService.deleteQuiz).toHaveBeenCalledWith(quizId);
            expect(result).toEqual({ message: 'Quiz successfully deleted' });
        });

        it('should throw NotFoundException if the quiz does not exist', async () => {
            const quizId = 'nonexistent';

            jest.spyOn(quizService, 'getQuizById').mockResolvedValueOnce(null);

            await expect(controller.deleteQuiz(quizId)).rejects.toThrow(NotFoundException);

            expect(quizService.getQuizById).toHaveBeenCalledWith(quizId);
            expect(quizService.deleteQuiz).not.toHaveBeenCalled();
        });
    });
});
