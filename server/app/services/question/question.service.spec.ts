import {
    MultipleChoiceQuestion,
    MultipleChoiceQuestionDocument,
    multipleChoiceQuestionSchema,
} from '@app/model/database/question-mcq-database.schema';
import { OpenEndedQuestion, OpenEndedQuestionDocument, openEndedQuestionSchema } from '@app/model/database/question-oeq-database.schema';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { QuestionService } from './question.service';

/* eslint-disable no-underscore-dangle */

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('QuestionServiceEndToEnd', () => {
    let service: QuestionService;
    let multipleChoiceQuestionModel: Model<MultipleChoiceQuestionDocument>;
    let openEndedQuestionModel: Model<OpenEndedQuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

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
                MongooseModule.forFeature([{ name: MultipleChoiceQuestion.name, schema: multipleChoiceQuestionSchema }], 'questions'),
                MongooseModule.forFeature([{ name: OpenEndedQuestion.name, schema: openEndedQuestionSchema }], 'questions'),
            ],
            providers: [QuestionService],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
        multipleChoiceQuestionModel = module.get<Model<MultipleChoiceQuestionDocument>>(getModelToken(MultipleChoiceQuestion.name, 'questions'));
        openEndedQuestionModel = module.get<Model<OpenEndedQuestionDocument>>(getModelToken(OpenEndedQuestion.name, 'questions'));
        connection = module.get(getConnectionToken('questions'));
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
        expect(openEndedQuestionModel).toBeDefined();
    });

    it('isQuestionTextInUse should return a open ended question if one with the same name exists in the database', async () => {
        await openEndedQuestionModel.deleteMany({});
        await multipleChoiceQuestionModel.deleteMany({});
        const questionText = 'What is the capital of France?';
        const question = getFakeOpenEndedQuestion();
        await openEndedQuestionModel.create({ ...question, text: questionText });

        const result = await service.isQuestionTextInUse(questionText);
        expect(validateOpenEndedQuestionInfo(result, { ...question, text: questionText })).toBeTruthy();
    });

    it('isQuestionTextInUse should return a multiple choice question if one with the same name exists in the database', async () => {
        await openEndedQuestionModel.deleteMany({});
        await multipleChoiceQuestionModel.deleteMany({});
        const questionText = 'What is the capital of France?';
        const question = getFakeMultipleChoiceQuestion();
        await multipleChoiceQuestionModel.create({ ...question, text: questionText });

        const result = await service.isQuestionTextInUse(questionText);
        if ('choices' in result) {
            expect(validateMultipleChoiceQuestionInfo(result, { ...question, text: questionText })).toBeTruthy();
        }
    });

    it('isQuestionTextInUse should return null if no question with the same name exists in the database', async () => {
        await openEndedQuestionModel.deleteMany({});
        await multipleChoiceQuestionModel.deleteMany({});
        const questionText = 'What is the capital of France?';

        const result = await service.isQuestionTextInUse(questionText);
        expect(result).toBeNull();
    });
});

const getFakeOpenEndedQuestion = (): OpenEndedQuestion => ({
    date: new Date(),
    type: 'QRL',
    text: getRandomString(),
    points: getRandomNumber(),
    _id: new Types.ObjectId(),
});

const getFakeMultipleChoiceQuestion = (): MultipleChoiceQuestion => ({
    date: new Date(),
    type: 'QCM',
    text: getRandomString(),
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

const validateOpenEndedQuestionInfo = (result: OpenEndedQuestion, question: OpenEndedQuestion): boolean => {
    expect(result.date.getTime()).toBeGreaterThanOrEqual(question.date.getTime());
    expect(result.type).toEqual(question.type);
    expect(result.text).toEqual(question.text);
    expect(result.points).toEqual(question.points);
    expect(result._id).toEqual(question._id);
    return true;
};

const validateMultipleChoiceQuestionInfo = (result: MultipleChoiceQuestion, question: MultipleChoiceQuestion): boolean => {
    expect(result.date.getTime()).toBeGreaterThanOrEqual(question.date.getTime());
    expect(result.type).toEqual(question.type);
    expect(result.text).toEqual(question.text);
    expect(result.points).toEqual(question.points);
    expect(result.choices.map((choice) => choice.text)).toEqual(question.choices.map((choice) => choice.text));
    expect(result.choices.map((choice) => choice.isCorrect)).toEqual(question.choices.map((choice) => choice.isCorrect));
    expect(result._id).toEqual(question._id);
    return true;
};

const BASE_36 = 36;
const MULTIPLE_IDENTIFIER = 10;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getRandomNumber = (): number => Math.floor(Math.random() * MULTIPLE_IDENTIFIER) * MULTIPLE_IDENTIFIER;
