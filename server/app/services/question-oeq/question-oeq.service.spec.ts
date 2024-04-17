import { OpenEndedQuestion, OpenEndedQuestionDocument, openEndedQuestionSchema } from '@app/model/database/question-oeq-database.schema';
import { QuestionService } from '@app/services/question/question.service';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { OpenEndedQuestionService } from './question-oeq.service';
/* eslint-disable no-underscore-dangle */
// disable no-underscore-dangle because _id is a valid property in MongoDB
const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('OpenEndedQuestionServiceEndToEnd', () => {
    let service: OpenEndedQuestionService;
    let openEndedQuestionModel: Model<OpenEndedQuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    const mockQuestionService = {
        isQuestionTextInUse: jest.fn(),
    };

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    connectionName: 'questions',
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: OpenEndedQuestion.name, schema: openEndedQuestionSchema }], 'questions'),
            ],
            providers: [OpenEndedQuestionService, { provide: QuestionService, useValue: mockQuestionService }],
        }).compile();

        service = module.get<OpenEndedQuestionService>(OpenEndedQuestionService);
        openEndedQuestionModel = module.get<Model<OpenEndedQuestionDocument>>(getModelToken(OpenEndedQuestion.name, 'questions'));
        connection = module.get(getConnectionToken('questions'));
    });

    afterEach((done) => {
        jest.clearAllMocks();
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(openEndedQuestionModel).toBeDefined();
    });

    it('getAllOpenEndedQuestions should return all open ended questions in database', async () => {
        await openEndedQuestionModel.deleteMany({});
        expect(await service.getAllOpenEndedQuestions()).toHaveLength(0);
        const fakeQuestions = Array.from({ length: 5 }, () => getFakeOpenEndedQuestion());
        await openEndedQuestionModel.insertMany(fakeQuestions);
        expect(await service.getAllOpenEndedQuestions()).toHaveLength(fakeQuestions.length);
    });

    it('getAllOpenEndedQuestions should handle errors', async () => {
        jest.spyOn(service.openEndedQuestionModel, 'find').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.getAllOpenEndedQuestions();
        } catch (e) {
            expect(e).toBe('Failed to get questions');
        }
    });

    it('getOpenEndedQuestion should return a specific open ended question', async () => {
        await openEndedQuestionModel.deleteMany({});
        const fakeQuestion = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(fakeQuestion);
        const result = await service.getOpenEndedQuestion(fakeQuestion._id);
        expect(validateOpenEndedQuestionInfo(result, fakeQuestion)).toBe(true);
    });

    it('getOpenEndedQuestion should fail if question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        expect(await service.getOpenEndedQuestion(question._id)).toBeNull();
    });

    it('getOpenEndedQuestion should handle errors', async () => {
        jest.spyOn(service.openEndedQuestionModel, 'findOne').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.getOpenEndedQuestion(new Types.ObjectId());
        } catch (e) {
            expect(e).toBe('Failed to get question: Error');
        }
    });

    it('addOpenEndedQuestion should fail if question is invalid', async () => {
        const question = getFakeOpenEndedQuestion();
        await expect(service.addOpenEndedQuestion({ ...question, type: 'QRL', points: 11 })).rejects.toBeTruthy();
        await expect(service.addOpenEndedQuestion({ ...question, type: 'QCM' })).rejects.toBeTruthy();
        await expect(service.addOpenEndedQuestion({ ...question, type: 'QRL', points: -2 })).rejects.toBeTruthy();
        await expect(service.addOpenEndedQuestion({ ...question, type: 'QRL', points: 110 })).rejects.toBeTruthy();
    });

    it('addOpenEndedQuestion should fail if question already exists', async () => {
        const question = getFakeOpenEndedQuestion();
        mockQuestionService.isQuestionTextInUse.mockResolvedValue(question);
        await openEndedQuestionModel.create(question);
        const questionClone = { ...question, _id: new Types.ObjectId() };
        await expect(service.addOpenEndedQuestion(questionClone)).rejects.toContain('Question already exists');
    });

    it('addOpenEndedQuestion should handle error', async () => {
        const mockError = new Error('Mock Error');
        const question = getFakeOpenEndedQuestion();
        mockQuestionService.isQuestionTextInUse.mockReturnValue(null);
        jest.spyOn(service.openEndedQuestionModel, 'create').mockImplementation(() => {
            throw mockError;
        });
        try {
            await service.addOpenEndedQuestion(question);
        } catch (e) {
            expect(e).toBe(`Failed to add question: ${mockError}`);
        }
    });

    it('addOpenEndedQuestion should fail if if mongo query failed', async () => {
        await openEndedQuestionModel.deleteMany({});
        jest.spyOn(openEndedQuestionModel, 'create').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeOpenEndedQuestion();
        await expect(service.addOpenEndedQuestion(question)).rejects.toBeTruthy();
    });

    it('deleteOpenEndedQuestion should delete a question from the DB', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        await service.deleteOpenEndedQuestion(question._id);
        expect(await openEndedQuestionModel.countDocuments()).toEqual(0);
    });

    it('deleteOpenEndedQuestion should fail if the question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        await expect(service.deleteOpenEndedQuestion(question._id)).rejects.toBeTruthy();
    });

    it('deleteOpenEndedQuestion should fail if mongo query failed', async () => {
        jest.spyOn(openEndedQuestionModel, 'deleteOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeOpenEndedQuestion();
        await expect(service.deleteOpenEndedQuestion(question._id)).rejects.toBeTruthy();
    });

    it('updateOpenEndedQuestion should update a question in the DB', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const newQuestion = getFakeOpenEndedQuestion();
        await service.updateOpenEndedQuestion(question._id, newQuestion);
        const result = await openEndedQuestionModel.findOne({ _id: question._id });
        const expected = { ...newQuestion, _id: question._id };
        expect(validateOpenEndedQuestionInfo(result, expected)).toBe(true);
    });

    it('updateOpenEndedQuestion should fail if the question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        const newQuestion = getFakeOpenEndedQuestion();
        await expect(service.updateOpenEndedQuestion(question._id, newQuestion)).rejects.toBeTruthy();
    });

    it('updateOpenEndedQuestion should fail if the question is invalid', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const newQuestion = getFakeOpenEndedQuestion();
        await expect(service.updateOpenEndedQuestion(question._id, { ...newQuestion, type: 'invalid' })).rejects.toBeTruthy();
        await expect(service.updateOpenEndedQuestion(question._id, { ...newQuestion, type: 'QRL', points: 11 })).rejects.toBeTruthy();
        await expect(service.updateOpenEndedQuestion(question._id, { ...newQuestion, type: 'QRL', points: -2 })).rejects.toBeTruthy();
        await expect(service.updateOpenEndedQuestion(question._id, { ...newQuestion, type: 'QRL', points: 110 })).rejects.toBeTruthy();
    });

    it('updateOpenEndedQuestion should fail if the question already exists', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const newQuestion = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(newQuestion);
        mockQuestionService.isQuestionTextInUse.mockResolvedValue(newQuestion);
        question.text = newQuestion.text;
        await expect(service.updateOpenEndedQuestion(question._id, question)).rejects.toBeTruthy();
    });

    it('updateOpenEndedQuestion should fail if mongo query failed', async () => {
        jest.spyOn(openEndedQuestionModel, 'updateOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeOpenEndedQuestion();
        const newQuestion = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        await expect(service.updateOpenEndedQuestion(question._id, newQuestion)).rejects.toBeTruthy();
    });

    it('getOpenEndedQuestionPoints should return the points of the question', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const result = await service.getOpenEndedQuestionPoints(question._id);
        expect(result).toEqual(question.points);
    });

    it('getOpenEndedQuestionPoints should fail if the question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        await expect(service.getOpenEndedQuestionPoints(question._id)).rejects.toBeTruthy();
    });

    it('getOpenEndedQuestionPoints should fail if mongo query failed', async () => {
        jest.spyOn(openEndedQuestionModel, 'findOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeOpenEndedQuestion();
        await expect(service.getOpenEndedQuestionPoints(question._id)).rejects.toBeTruthy();
    });

    it('getOpenEndedQuestionType should return the type of the question', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const result = await service.getOpenEndedQuestionType(question._id);
        expect(result).toEqual(question.type);
    });

    it('getOpenEndedQuestionType should fail if the question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        await expect(service.getOpenEndedQuestionType(question._id)).rejects.toBeTruthy();
    });

    it('getOpenEndedQuestionDate should return the date of the question', async () => {
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create(question);
        const result = await service.getOpenEndedQuestionDate(question._id);
        expect(result).toEqual(question.date);
    });

    it('getOpenEndedQuestionDate should fail if the question does not exist', async () => {
        await openEndedQuestionModel.deleteMany({});
        const question = getFakeOpenEndedQuestion();
        await expect(service.getOpenEndedQuestionDate(question._id)).rejects.toBeTruthy();
    });
});

const getFakeOpenEndedQuestion = (): OpenEndedQuestion => ({
    date: new Date(),
    type: 'QRL',
    text: getRandomString(),
    points: getRandomNumber(),
    _id: new Types.ObjectId(),
});

const validateOpenEndedQuestionInfo = (result: OpenEndedQuestion, question: OpenEndedQuestion): boolean => {
    expect(result.date.getTime()).toBeGreaterThanOrEqual(question.date.getTime());
    expect(result.type).toEqual(question.type);
    expect(result.text).toEqual(question.text);
    expect(result.points).toEqual(question.points);
    expect(result._id).toEqual(question._id);
    return true;
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
