import { MultipleChoiceQuestion, MultipleChoiceQuestionDocument, multipleChoiceQuestionSchema } from '@app/model/database/question-mcq';
import { Logger } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { MultipleChoiceQuestionService } from './question-mcq.service';

/* eslint-disable no-underscore-dangle */

const DELAY_BEFORE_CLOSING_CONNECTION = 500;

describe('MultipleChoiceQuestionServiceEndToEnd', () => {
    let service: MultipleChoiceQuestionService;
    let multipleChoiceQuestionModel: Model<MultipleChoiceQuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: MultipleChoiceQuestion.name, schema: multipleChoiceQuestionSchema }]),
            ],
            providers: [MultipleChoiceQuestionService, Logger],
        }).compile();

        service = module.get<MultipleChoiceQuestionService>(MultipleChoiceQuestionService);
        multipleChoiceQuestionModel = module.get<Model<MultipleChoiceQuestionDocument>>(getModelToken(MultipleChoiceQuestion.name));
        connection = module.get(getConnectionToken());
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
        expect(multipleChoiceQuestionModel).toBeDefined();
    });

    it('getAllMultipleChoiceQuestions() return all questions in database', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        expect((await service.getAllMultipleChoiceQuestions()).length).toEqual(0);
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        expect((await service.getAllMultipleChoiceQuestions()).length).toEqual(1);
    });

    it('getAllMultipleChoiceQuestions() should handle error', async () => {
        jest.spyOn(service.multipleChoiceQuestionModel, 'find').mockImplementation(() => {
            throw new Error();
        });

        try {
            await service.getAllMultipleChoiceQuestions();
        } catch (e) {
            expect(e).toBe('Failed to get questions');
        }
    });

    it('getMultipleChoiceQuestion() return question with the specified question', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const result = await service.getMultipleChoiceQuestion(question._id);
        expect(validateMultipleChoiceQuestionInfo(result, question)).toBe(true);
    });

    it('getMultipleChoiceQuestion() should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        expect(await service.getMultipleChoiceQuestion(question._id)).toBeNull();
    });

    it('getMultipleChoiceQuestion() should handle error', async () => {
        const mockError = new Error('Mock Error');
        jest.spyOn(service.multipleChoiceQuestionModel, 'findOne').mockImplementation(() => {
            throw mockError;
        });

        try {
            await service.getMultipleChoiceQuestion(new Types.ObjectId());
        } catch (e) {
            expect(e).toBe(`Failed to get question: Error: ${mockError.message}`);
        }
    });

    it('addMultipleChoiceQuestion() should add a question to the DB', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await service.addMultipleChoiceQuestion(question);
        expect(await multipleChoiceQuestionModel.countDocuments()).toEqual(1);
    });

    it('addMultipleChoiceQuestion() should fail if question is invalid', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.addMultipleChoiceQuestion({ ...question, type: 'QCM', points: 11 })).rejects.toBeTruthy();
        await expect(service.addMultipleChoiceQuestion({ ...question, type: 'QRL' })).rejects.toBeTruthy();
        await expect(service.addMultipleChoiceQuestion({ ...question, type: 'QCM', points: 10, choices: [] })).rejects.toBeTruthy();
        await expect(service.addMultipleChoiceQuestion({ ...question, type: 'QCM', points: -2 })).rejects.toBeTruthy();
        await expect(service.addMultipleChoiceQuestion({ ...question, type: 'QCM', points: 110 })).rejects.toBeTruthy();
        await expect(
            service.addMultipleChoiceQuestion({ ...question, choices: [{ text: getRandomString(), isCorrect: false }] }),
        ).rejects.toBeTruthy();
    });

    it('addMultipleChoiceQuestion() should fail if question already exists', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        question._id = new Types.ObjectId();
        await expect(service.addMultipleChoiceQuestion(question)).rejects.toBeTruthy();
        try {
            await service.addMultipleChoiceQuestion(question);
        } catch (e) {
            expect(e).toBe('invalid question: Error: Question already exists');
        }
    });

    it('addMultipleChoiceQuestion() should handle error', async () => {
        const mockError = new Error('Mock Error');
        const question = getFakeMultipleChoiceQuestion();
        jest.spyOn(service.multipleChoiceQuestionModel, 'create').mockImplementation(() => {
            throw mockError;
        });
        try {
            await service.addMultipleChoiceQuestion(question);
        } catch (e) {
            expect(e).toBe(`Failed to add question: ${mockError}`);
        }
    });

    it('addMultipleChoiceQuestion() should fail if if mongo query failed', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        jest.spyOn(multipleChoiceQuestionModel, 'create').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.addMultipleChoiceQuestion(question)).rejects.toBeTruthy();
    });

    it('deleteMultipleChoiceQuestion() should delete a question from the DB', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        await service.deleteMultipleChoiceQuestion(question._id);
        expect(await multipleChoiceQuestionModel.countDocuments()).toEqual(0);
    });

    it('deleteMultipleChoiceQuestion() should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.deleteMultipleChoiceQuestion(question._id)).rejects.toBeTruthy();
    });

    it('deleteMultipleChoiceQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(multipleChoiceQuestionModel, 'deleteOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.deleteMultipleChoiceQuestion(question._id)).rejects.toBeTruthy();
    });

    it('updateMultipleChoiceQuestion() should update a question in the DB', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const newQuestion = getFakeMultipleChoiceQuestion();
        await service.updateMultipleChoiceQuestion(question._id, newQuestion);
        const result = await multipleChoiceQuestionModel.findOne({ _id: question._id });
        const expected = { ...newQuestion, _id: question._id };
        expect(validateMultipleChoiceQuestionInfo(result, expected)).toBe(true);
    });

    it('updateMultipleChoiceQuestion() should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        const newQuestion = getFakeMultipleChoiceQuestion();
        await expect(service.updateMultipleChoiceQuestion(question._id, newQuestion)).rejects.toBeTruthy();
    });

    it('updateMultipleChoiceQuestion() should fail if the question is invalid', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const newQuestion = getFakeMultipleChoiceQuestion();
        await expect(service.updateMultipleChoiceQuestion(question._id, { ...newQuestion, type: 'invalid' })).rejects.toBeTruthy();
        await expect(service.updateMultipleChoiceQuestion(question._id, { ...newQuestion, type: 'QCM', points: 11 })).rejects.toBeTruthy();
        await expect(service.updateMultipleChoiceQuestion(question._id, { ...newQuestion, choices: [] })).rejects.toBeTruthy();
        await expect(service.updateMultipleChoiceQuestion(question._id, { ...newQuestion, type: 'QCM', points: -2 })).rejects.toBeTruthy();
        await expect(service.updateMultipleChoiceQuestion(question._id, { ...newQuestion, type: 'QCM', points: 110 })).rejects.toBeTruthy();
    });

    it('updateMultipleChoiceQuestion() should fail if the question already exists', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const newQuestion = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(newQuestion);
        question.question = newQuestion.question;
        await expect(service.updateMultipleChoiceQuestion(question._id, question)).rejects.toBeTruthy();
    });

    it('updateMultipleChoiceQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(multipleChoiceQuestionModel, 'updateOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeMultipleChoiceQuestion();
        const newQuestion = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        await expect(service.updateMultipleChoiceQuestion(question._id, newQuestion)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionChoices() should return the choices of the question', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const result = await service.getMultipleChoiceQuestionChoices(question._id);
        for (let i = 0; i < result.length; i++) {
            expect(result[i].text).toEqual(question.choices[i].text);
            expect(result[i].isCorrect).toEqual(question.choices[i].isCorrect);
        }
    });

    it('getMultipleChoiceQuestionChoices should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionChoices(question._id)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionChoices should fail if mongo query failed', async () => {
        jest.spyOn(multipleChoiceQuestionModel, 'findOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionChoices(question._id)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionPoints() should return the points of the question', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const result = await service.getMultipleChoiceQuestionPoints(question._id);
        expect(result).toEqual(question.points);
    });

    it('getMultipleChoiceQuestionPoints should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionPoints(question._id)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionPoints should fail if mongo query failed', async () => {
        jest.spyOn(multipleChoiceQuestionModel, 'findOne').mockRejectedValue(async () => Promise.reject(''));
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionPoints(question._id)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionType() should return the type of the question', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const result = await service.getMultipleChoiceQuestionType(question._id);
        expect(result).toEqual(question.type);
    });

    it('getMultipleChoiceQuestionType should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionType(question._id)).rejects.toBeTruthy();
    });

    it('getMultipleChoiceQuestionDate() should return the date of the question', async () => {
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create(question);
        const result = await service.getMultipleChoiceQuestionDate(question._id);
        expect(result).toEqual(question.date);
    });

    it('getMultipleChoiceQuestionDate should fail if the question does not exist', async () => {
        await multipleChoiceQuestionModel.deleteMany({});
        const question = getFakeMultipleChoiceQuestion();
        await expect(service.getMultipleChoiceQuestionDate(question._id)).rejects.toBeTruthy();
    });
});

const getFakeMultipleChoiceQuestion = (): MultipleChoiceQuestion => ({
    date: new Date(),
    type: 'QCM',
    question: getRandomString(),
    points: getRandomNumber(),
    choices: [
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
    _id: new Types.ObjectId(),
});

const validateMultipleChoiceQuestionInfo = (result: MultipleChoiceQuestion, question: MultipleChoiceQuestion): boolean => {
    expect(result.date.getTime()).toBeGreaterThanOrEqual(question.date.getTime());
    expect(result.type).toEqual(question.type);
    expect(result.question).toEqual(question.question);
    expect(result.points).toEqual(question.points);
    expect(result.choices.map((choice) => choice.text)).toEqual(question.choices.map((choice) => choice.text));
    expect(result.choices.map((choice) => choice.isCorrect)).toEqual(question.choices.map((choice) => choice.isCorrect));
    expect(result._id).toEqual(question._id);
    return true;
};

const BASE_36 = 36;
const BASE_10 = 10;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * BASE_10) * BASE_10;
