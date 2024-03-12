import { Question, Quiz } from '@app/model/quiz/quiz.schema';
import { FileManagerService } from '@app/services/file-manager/file-manager.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketService } from '@app/services/socket/socket.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('QuizService', () => {
    let service: QuizService;
    let serviceFileManager: FileManagerService;
    let mockFileManagerService: jest.Mocked<FileManagerService>;
    const IDLENGTH = 6;
    const QUIZNOTFOUND = -1;
    let mockQuiz: Quiz;

    const mockSocketService = {
        getSocketsInRoom: jest.fn(),
        getAllUsernamesInRoom: jest.fn(),
        isUserValid: jest.fn(),
        isLoginValid: jest.fn(),
    };

    beforeEach(async () => {
        mockQuiz = {
            id: '1a2b3d',
            visible: true,
            title: 'Questionnaire sur le JS 1',
            description: 'Questions de pratique sur le langage JavaScript',
            duration: 60,
            lastModification: '2018-11-13T20:20:39+00:00',
            questions: [],
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizService,
                {
                    provide: FileManagerService,
                    useFactory: () => ({
                        readCustomFile: jest.fn().mockResolvedValue(JSON.stringify([mockQuiz])),
                        writeCustomFile: jest.fn().mockResolvedValue(undefined),
                    }),
                },
                { provide: SocketService, useValue: mockSocketService },
            ],
        }).compile();

        service = module.get<QuizService>(QuizService);
        serviceFileManager = module.get<FileManagerService>(FileManagerService);
        mockFileManagerService = module.get<FileManagerService>(FileManagerService) as jest.Mocked<FileManagerService>;
        jest.spyOn(serviceFileManager, 'writeCustomFile').mockImplementation(async () => Promise.resolve());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return quizzes', async () => {
        const result = await service.getAllQuiz();

        expect(mockFileManagerService.readCustomFile).toHaveBeenCalled();
        expect(result[0]).toEqual(mockQuiz);
    });

    it('should return one quiz if it exists', async () => {
        const result = await service.getQuizById('1a2b3d');
        expect(mockFileManagerService.readCustomFile).toHaveBeenCalled();
        const quizzes = JSON.parse(await mockFileManagerService.readCustomFile('/../../../../../assets/quiz-example.json'));
        expect(result).toEqual(quizzes.find((q: Quiz) => q.id === '1a2b3d'));
    });

    it("should return null if it doesn't exist", async () => {
        const result = await service.getQuizById('bad-id');

        expect(mockFileManagerService.readCustomFile).toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('should delete quiz if it exists', async () => {
        const mockQuizId = '1a2b3d';
        jest.spyOn(service, 'getQuizById').mockResolvedValueOnce(mockQuiz);

        await service.deleteQuiz(mockQuizId);

        expect(mockFileManagerService.readCustomFile).toHaveBeenCalled();
        expect(mockFileManagerService.writeCustomFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if quiz doesn't exist", async () => {
        const nonExistentQuizId = 'non-existent-id';
        jest.spyOn(service, 'getQuizById').mockResolvedValueOnce(null);

        await expect(service.deleteQuiz(nonExistentQuizId)).rejects.toThrow(NotFoundException);
    });

    it('should check question', async () => {
        const question = {
            type: 'QCM',
            text: 'Quelle est la couleur du cheval blanc de Napoléon ?',
            points: 10,
            choices: [
                { text: 'Blanc', isCorrect: true },
                { text: 'Noir', isCorrect: false },
            ],
        };
        const result = await service.checkQuestion(question);
        expect(result).toBe(true);
    });

    it('should not add quiz', async () => {
        const result = await service.addQuiz(mockQuiz);
        expect(result).toBe(false);
    });

    it('should not validate quiz', () => {
        const result = service.validateQuiz(mockQuiz);
        expect(result).toBe(false);
    });

    it('should generate random ID', () => {
        const result = service.generateRandomID(IDLENGTH);
        expect(result).toHaveLength(IDLENGTH);
    });

    it('should delete quiz', async () => {
        service.getQuizById = jest.fn().mockResolvedValueOnce(mockQuiz);
        const result = await service.deleteQuiz(mockQuiz.id);
        expect(result).toBe(undefined);
    });

    it('should add a new quiz', async () => {
        service.validateQuiz = jest.fn().mockReturnValueOnce(true);
        service.generateRandomID = jest.fn().mockReturnValueOnce('1a2b3d');
        const result = await service.addQuiz(mockQuiz);
        expect(result).toBe(true);
    });

    it('should update an existing quiz', async () => {
        Array.prototype.find = jest.fn().mockImplementation(undefined);
        service.validateQuiz = jest.fn().mockReturnValueOnce(true);
        const result = await service.addQuiz(mockQuiz);
        expect(result).toBe(true);
    });

    it('should validate quiz', () => {
        const question = {
            id: 'a1b2c3',
            visible: true,
            title: 'dasdsa',
            description: 'dasdsa',
            duration: 60,
            lastModification: '2018-11-13T20:20:39+00:00',
            questions: [{} as Question, {} as Question],
        };
        const result = service.validateQuiz(question);
        expect(result).toBe(true);
    });

    it('should throw NotFoundException', async () => {
        service.getQuizById = jest.fn().mockResolvedValueOnce(null);
        await expect(service.updateQuizVisibility(mockQuiz.id)).rejects.toThrow(NotFoundException);
    });

    it('should not find index', async () => {
        Array.prototype.findIndex = jest.fn().mockReturnValueOnce(QUIZNOTFOUND);
        await expect(service.updateQuizVisibility(mockQuiz.id)).rejects.toThrow(NotFoundException);
    });

    it('shoud not delete quiz if not found', async () => {
        Array.prototype.findIndex = jest.fn().mockReturnValue(QUIZNOTFOUND);
        await expect(service.deleteQuiz(mockQuiz.id)).rejects.toThrow(NotFoundException);
    });

    it('should toggle quiz visibility and return updated quiz', async () => {
        const mockQuizz = { id: mockQuiz.id, visible: false };
        const mockQuizList = [mockQuizz];
        Array.prototype.findIndex = jest.fn().mockReturnValueOnce(0);

        service.getQuizById = jest.fn().mockResolvedValueOnce(mockQuizz);
        service.getAllQuiz = jest.fn().mockResolvedValueOnce(mockQuizList);

        const updatedQuiz = await service.updateQuizVisibility(mockQuizz.id);

        expect(updatedQuiz.visible).toBe(true);
        expect(serviceFileManager.writeCustomFile).toHaveBeenCalledWith(expect.any(String), JSON.stringify(mockQuizList, null, 2));
    });
});
