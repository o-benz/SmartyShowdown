/* eslint-disable max-lines */
import { DataBaseQuiz, QuizDocument, quizSchema } from '@app/model/database/quiz-database.schema';
import { Question, Quiz } from '@app/model/quiz/quiz.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { Server, Socket } from 'socket.io';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('QuizService', () => {
    let service: QuizService;
    let mockQuiz: Quiz;
    let quizModel: Model<QuizDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    const IDLENGTH = 6;

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
            questions: [
                {
                    type: 'QCM',
                    text: 'Quelle est la couleur du cheval blanc de Napoléon ?',
                    points: 10,
                    choices: [
                        { text: 'Blanc', isCorrect: true },
                        { text: 'Noir', isCorrect: false },
                    ],
                },
            ] as Question[],
        };
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    connectionName: 'quizzes',
                    useFactory: async () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: DataBaseQuiz.name, schema: quizSchema }], 'quizzes'),
            ],
            providers: [QuizService, { provide: SocketService, useValue: mockSocketService }],
        }).compile();

        service = module.get<QuizService>(QuizService);
        quizModel = module.get<Model<QuizDocument>>(getModelToken(DataBaseQuiz.name, 'quizzes'));
        connection = module.get(getConnectionToken('quizzes'));
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllQuiz() should return all questions in database', async () => {
        await quizModel.deleteMany({});
        expect((await service.getAllQuiz()).length).toEqual(0);
        await quizModel.create(mockQuiz);
        expect((await service.getAllQuiz()).length).toEqual(1);
    });

    it('getAllQuiz() should handle error', async () => {
        jest.spyOn(service['quizModel'], 'find').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.getAllQuiz();
        } catch (e) {
            expect(e).toBe('Failed to get quizzes');
        }
    });

    it('checkQuestion should return false when question text is empty', async () => {
        const mockQuestion = {
            text: '',
            type: 'QCM',
            points: 10,
            choices: [
                { text: 'Blue', isCorrect: true },
                { text: 'Green', isCorrect: false },
            ],
        } as Question;
        const checkMCQSpy = jest.spyOn(service, 'checkMCQ');
        const result = await service.checkQuestion(mockQuestion);
        expect(checkMCQSpy).toBeCalledWith(mockQuestion);
        expect(result).toBe(false);
    });

    it('checkQuestion should return true when question is valid', async () => {
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

    it('checkQuestion should not call checkMCQ when question type is not QCM', async () => {
        const question = {
            type: 'QRL',
            text: 'Quelle est la couleur du cheval blanc de Napoléon ?',
            points: 10,
        };
        const checkMCQSpy = jest.spyOn(service, 'checkMCQ');
        const result = await service.checkQuestion(question);
        expect(checkMCQSpy).not.toBeCalled();
        expect(result).toBe(true);
    });

    it('getQuizById should return one quiz if it exists', async () => {
        await quizModel.deleteMany({});
        await quizModel.create(mockQuiz);
        const result = await service.getQuizById('1a2b3d');
        expect(result.id).toEqual(mockQuiz.id);
    });

    it('getQuizById should handle error', async () => {
        jest.spyOn(service['quizModel'], 'findOne').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.getQuizById('1a2b3d');
        } catch (e) {
            expect(e).toBe('Failed to get quiz: Error');
        }
    });

    it("getQuizById should return null if it doesn't exist", async () => {
        await quizModel.deleteMany({});
        await quizModel.create(mockQuiz);
        const result = await service.getQuizById('bad-id');
        expect(result).toBeNull();
    });

    it('checkMCQ should return false when no correct answer', async () => {
        const mockQuestion = {
            text: 'What is the capital of France ?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: false },
                { text: 'London', isCorrect: false },
            ],
        } as Question;
        const result = await service.checkMCQ(mockQuestion);
        expect(result).toBe(false);
    });

    it('checkMCQ should return false when too many choices', async () => {
        const mockQuestion = {
            text: 'What is the capital of France ?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'London', isCorrect: false },
                { text: 'Berlin', isCorrect: false },
                { text: 'Madrid', isCorrect: false },
                { text: 'Rome', isCorrect: false },
            ],
        } as Question;
        const result = await service.checkMCQ(mockQuestion);
        expect(result).toBe(false);
    });

    it('checkMCQ should return false when too few choices', async () => {
        const mockQuestion = {
            text: 'What is the capital of France ?',
            points: 10,
            choices: [{ text: 'Paris', isCorrect: true }],
        } as Question;
        const result = await service.checkMCQ(mockQuestion);
        expect(result).toBe(false);
    });

    it('checkMCQ should return false when no incorrect answer', async () => {
        const mockQuestion = {
            text: 'What is the capital of France ?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'London', isCorrect: true },
            ],
        } as Question;
        const result = await service.checkMCQ(mockQuestion);
        expect(result).toBe(false);
    });

    it('checkMCQ should return true when question is valid', async () => {
        const mockQuestion = {
            text: 'What is the capital of France ?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'London', isCorrect: false },
            ],
        } as Question;
        const result = await service.checkMCQ(mockQuestion);
        expect(result).toBe(true);
    });

    it('addQuiz should create quiz when no id matches', async () => {
        jest.spyOn(service, 'validateQuiz').mockReturnValue(true);
        jest.spyOn(service['quizModel'], 'find').mockImplementation(() => {
            throw new Error();
        });

        const newQuiz = { ...mockQuiz, name: 'New Quiz' };
        const result = await service.addQuiz(newQuiz);

        expect(result).toBe(true);
    });

    it('addQuiz should update quiz when id matches', async () => {
        jest.spyOn(service, 'validateQuiz').mockReturnValue(true);
        jest.spyOn(service['quizModel'], 'findOne').mockResolvedValue(mockQuiz);

        const newQuiz = { ...mockQuiz, name: 'New Quiz' };
        const result = await service.addQuiz(newQuiz);

        expect(result).toBe(true);
    });

    it('addQuiz should not add quiz if it is not valid', async () => {
        jest.spyOn(service, 'validateQuiz').mockReturnValue(false);
        const result = await service.addQuiz(mockQuiz);
        expect(result).toBe(false);
    });

    it('addQuiz should not add quiz if another quiz has the same title but different id', async () => {
        jest.spyOn(service, 'validateQuiz').mockReturnValue(true);
        jest.spyOn(service['quizModel'], 'findOne').mockResolvedValue(mockQuiz);

        const newQuiz = { ...mockQuiz, id: 'new-id' };
        const result = await service.addQuiz(newQuiz);

        expect(result).toBe(false);
    });

    it('addQuiz should handle error', async () => {
        jest.spyOn(service['quizModel'], 'findOne').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.addQuiz(mockQuiz);
        } catch (e) {
            expect(e).toBe('Failed to add quiz: Error');
        }
    });

    it('deleteQuiz should delete quiz if it exists', async () => {
        await quizModel.deleteMany({});
        await quizModel.create(mockQuiz);
        expect((await service.getAllQuiz()).length).toEqual(1);

        await service.deleteQuiz('1a2b3d');
        expect((await service.getAllQuiz()).length).toEqual(0);
    });

    it("deleteQuiz should throw NotFoundException if quiz doesn't exist", async () => {
        await quizModel.deleteMany({});
        try {
            await service.deleteQuiz('1a2b3d');
        } catch (e) {
            expect(e).toBe('Failed to delete quiz: NotFoundException: Quiz with ID 1a2b3d not found');
        }
    });

    it('validateQuiz should validate quiz if it is valid', () => {
        expect(service.validateQuiz(mockQuiz)).toBe(true);
    });

    it('validateQuiz should not validate quiz if title is invalid', () => {
        mockQuiz.title = '';
        expect(service.validateQuiz(mockQuiz)).toBe(false);
    });

    it('validateQuiz should not validate quiz if description is invalid', () => {
        mockQuiz.description = '';
        expect(service.validateQuiz(mockQuiz)).toBe(false);
    });

    it('validateQuiz should validate quiz', () => {
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

    it('should generate random ID', () => {
        const result = service.generateRandomID(IDLENGTH);
        expect(result).toHaveLength(IDLENGTH);
    });

    it('updateQuizVisibility should toggle quiz visibility', async () => {
        await quizModel.deleteMany({});
        await quizModel.create(mockQuiz);

        const result = await service.updateQuizVisibility('1a2b3d');
        expect(result.visible).toBe(false);
        const mockquiz2 = await service.getQuizById('1a2b3d');
        expect(mockquiz2.visible).toBe(false);
    });

    it('updateQuizVisibility should throw NotFoundException if quiz not found in the list', async () => {
        await quizModel.deleteMany({});
        try {
            await service.updateQuizVisibility('1a2b3d');
        } catch (e) {
            expect(e).toBe('Failed to update quiz visibility: NotFoundException: Quiz with ID 1a2b3d not found');
        }
    });

    it('should populate game stats correctly', async () => {
        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuiz);
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = await service.populateGameStats(mockServer as any, mockSocket, mockQuiz.id);

        expect(stats).toEqual({
            id: mockQuiz.id,
            duration: mockQuiz.duration,
            name: mockQuiz.title,
            questions: [
                {
                    title: mockQuiz.questions[0].text,
                    type: mockQuiz.questions[0].type,
                    points: mockQuiz.questions[0].points,
                    statLines: mockQuiz.questions[0].choices?.map((choice) => {
                        return { label: choice.text, users: [], isCorrect: choice.isCorrect };
                    }),
                },
            ],
            users: [],
        });
    });

    it('should handle question without choices', async () => {
        const mockQuizWithoutChoices = {
            ...mockQuiz,
            questions: [
                {
                    text: 'Question Text',
                    type: 'QCM',
                    points: 10,
                    // No choices property
                },
            ],
        };
        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuizWithoutChoices);
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await service.populateGameStats(mockServer as any, mockSocket, mockQuizWithoutChoices.id);

        expect(result).toEqual({
            id: mockQuizWithoutChoices.id,
            duration: mockQuizWithoutChoices.duration,
            name: mockQuizWithoutChoices.title,
            questions: [
                {
                    title: mockQuizWithoutChoices.questions[0].text,
                    type: mockQuizWithoutChoices.questions[0].type,
                    points: mockQuizWithoutChoices.questions[0].points,
                    // statLines should be undefined
                    statLines: undefined,
                },
            ],
            users: [],
        });
    });

    it('should handle question without choices', async () => {
        const mockQuizWithoutChoices = {
            ...mockQuiz,
            questions: [
                {
                    text: 'Question Text',
                    type: 'QRL',
                    points: 10,
                },
            ],
        };
        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuizWithoutChoices);
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await service.populateGameStats(mockServer as any, mockSocket, mockQuizWithoutChoices.id);

        expect(result).toEqual({
            id: mockQuizWithoutChoices.id,
            duration: mockQuizWithoutChoices.duration,
            name: mockQuizWithoutChoices.title,
            questions: [
                {
                    title: mockQuizWithoutChoices.questions[0].text,
                    type: mockQuizWithoutChoices.questions[0].type,
                    points: mockQuizWithoutChoices.questions[0].points,
                    statLines: [
                        { label: 'active', users: [], isCorrect: false },
                        { label: 'inactive', users: [], isCorrect: false },
                    ],
                    pointsGiven: { none: [], half: [], all: [] },
                },
            ],
            users: [],
        });
    });

    it('should populate game stats randomly with QCM questions', async () => {
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        const mockQuizWithQCMQuestions: Quiz = {
            ...mockQuiz,
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
                {
                    type: 'QCM',
                    text: 'Question 2',
                    points: 20,
                    choices: [
                        { text: 'Choice A', isCorrect: true },
                        { text: 'Choice B', isCorrect: false },
                        { text: 'Choice C', isCorrect: false },
                    ],
                },
            ],
        };

        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuizWithQCMQuestions);

        const result = await service.populateGameStatsRandom(mockServer, mockSocket, mockQuizWithQCMQuestions);

        expect(result).toEqual({
            id: mockQuizWithQCMQuestions.id,
            duration: mockQuizWithQCMQuestions.duration,
            name: mockQuizWithQCMQuestions.title,
            questions: [
                {
                    title: 'Question 1',
                    type: 'QCM',
                    points: 10,
                    statLines: [
                        { label: 'Choice 1', users: [], isCorrect: true },
                        { label: 'Choice 2', users: [], isCorrect: false },
                    ],
                },
                {
                    title: 'Question 2',
                    type: 'QCM',
                    points: 20,
                    statLines: [
                        { label: 'Choice A', users: [], isCorrect: true },
                        { label: 'Choice B', users: [], isCorrect: false },
                        { label: 'Choice C', users: [], isCorrect: false },
                    ],
                },
            ],
            users: [],
        });
    });

    it('should populate game stats randomly when no choices', async () => {
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        const mockQuizWithQCMQuestions: Quiz = {
            ...mockQuiz,
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1',
                    points: 10,
                },
                {
                    type: 'QCM',
                    text: 'Question 2',
                    points: 20,
                },
            ],
        };

        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuizWithQCMQuestions);

        const result = await service.populateGameStatsRandom(mockServer, mockSocket, mockQuizWithQCMQuestions);

        expect(result).toEqual({
            id: mockQuizWithQCMQuestions.id,
            duration: mockQuizWithQCMQuestions.duration,
            name: mockQuizWithQCMQuestions.title,
            questions: [
                {
                    title: 'Question 1',
                    type: 'QCM',
                    points: 10,
                    statLines: [],
                },
                {
                    title: 'Question 2',
                    type: 'QCM',
                    points: 20,
                    statLines: [],
                },
            ],
            users: [],
        });
    });

    it('should handle empty quiz', async () => {
        const mockServer = mockSocketService.getSocketsInRoom as unknown as Server;
        const mockSocket = {} as Socket;

        const mockEmptyQuiz: Quiz = {
            ...mockQuiz,
            questions: [],
        };

        jest.spyOn(service, 'getQuizById').mockResolvedValue(mockEmptyQuiz);

        const result = await service.populateGameStatsRandom(mockServer, mockSocket, mockEmptyQuiz);

        expect(result).toEqual({
            id: mockEmptyQuiz.id,
            duration: mockEmptyQuiz.duration,
            name: mockEmptyQuiz.title,
            questions: [],
            users: [],
        });
    });
});
