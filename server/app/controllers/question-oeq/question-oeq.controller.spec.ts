import { OpenEndedQuestion } from '@app/model/database/question-oeq-database.schema';
import { OpenEndedQuestionService } from '@app/services/question-oeq/question-oeq.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Types } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { OpenEndedQuestionController } from './question-oeq.controller';

describe('QuestionController', () => {
    let controller: OpenEndedQuestionController;
    let oeqService: SinonStubbedInstance<OpenEndedQuestionService>;

    beforeEach(async () => {
        oeqService = createStubInstance(OpenEndedQuestionService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OpenEndedQuestionController],
            providers: [
                {
                    provide: OpenEndedQuestionService,
                    useValue: oeqService,
                },
            ],
        }).compile();

        controller = module.get<OpenEndedQuestionController>(OpenEndedQuestionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allOpenEndedQuestion should return all multiple choice questions', async () => {
        const fakeQuestions = [new OpenEndedQuestion(), new OpenEndedQuestion()];
        oeqService.getAllOpenEndedQuestions.resolves(fakeQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (questions) => {
            expect(questions).toEqual(fakeQuestions);
            return res;
        };

        await controller.allOpenEndedQuestion(res);
    });

    it('allOpenEndedQuestion should return NOT_FOUND when service unable to fetch questions', async () => {
        oeqService.getAllOpenEndedQuestions.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allOpenEndedQuestion(res);
    });

    it('openEndedQuestion should return question by question _id', async () => {
        const fakeQuestion = new OpenEndedQuestion();
        oeqService.getOpenEndedQuestion.resolves(fakeQuestion);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(fakeQuestion);
            return res;
        };

        await controller.openEndedQuestion(new Types.ObjectId(), res);
    });

    it('openEndedQuestion should return NOT_FOUND when service unable to fetch the question', async () => {
        oeqService.getOpenEndedQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.openEndedQuestion(new Types.ObjectId(), res);
    });

    it('addOpenEndedQuestion should add new question', async () => {
        oeqService.addOpenEndedQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addOpenEndedQuestion(new OpenEndedQuestion(), res);
    });

    it('addOpenEndedQuestion should not work when trying to add a question with a date', async () => {
        const fakeQuestion = new OpenEndedQuestion();
        fakeQuestion.date = new Date();
        oeqService.addOpenEndedQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addOpenEndedQuestion(fakeQuestion, res);
    });

    it('addOpenEndedQuestion should not work when trying to add a question with a type', async () => {
        const fakeQuestion = new OpenEndedQuestion();
        fakeQuestion.type = 'type';
        oeqService.addOpenEndedQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addOpenEndedQuestion(fakeQuestion, res);
    });

    it('addOpenEndedQuestion should return NOT_FOUND when service unable to add the question', async () => {
        oeqService.addOpenEndedQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addOpenEndedQuestion(new OpenEndedQuestion(), res);
    });

    it('deleteOpenEndedQuestion should delete question', async () => {
        oeqService.deleteOpenEndedQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteOpenEndedQuestion(new Types.ObjectId(), res);
    });

    it('deleteOpenEndedQuestion should return NOT_FOUND when service unable to delete the question', async () => {
        oeqService.deleteOpenEndedQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.deleteOpenEndedQuestion(new Types.ObjectId(), res);
    });

    it('modifyOpenEndedQuestion should modify question', async () => {
        oeqService.updateOpenEndedQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyOpenEndedQuestion(new OpenEndedQuestion(), res);
    });

    it('modifyOpenEndedQuestion should return NOT_FOUND when service unable to modify the question', async () => {
        oeqService.updateOpenEndedQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.modifyOpenEndedQuestion(new OpenEndedQuestion(), res);
    });

    it('getOpenEndedQuestionPoints should return question points', async () => {
        const fakePoints = 10;
        oeqService.getOpenEndedQuestionPoints.resolves(fakePoints);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (points) => {
            expect(points).toEqual(fakePoints);
            return res;
        };

        await controller.getOpenEndedQuestionPoints(new Types.ObjectId(), res);
    });

    it('getOpenEndedQuestionPoints should return NOT_FOUND when service unable to fetch the question points', async () => {
        oeqService.getOpenEndedQuestionPoints.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getOpenEndedQuestionPoints(new Types.ObjectId(), res);
    });

    it('getOpenEndedQuestionType should return question type', async () => {
        const fakeType = 'type';
        oeqService.getOpenEndedQuestionType.resolves(fakeType);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (type) => {
            expect(type).toEqual(fakeType);
            return res;
        };

        await controller.getOpenEndedQuestionType(new Types.ObjectId(), res);
    });

    it('getOpenEndedQuestionType should return NOT_FOUND when service unable to fetch the question type', async () => {
        oeqService.getOpenEndedQuestionType.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getOpenEndedQuestionType(new Types.ObjectId(), res);
    });

    it('getOpenEndedQuestionDate should return question date', async () => {
        const fakeDate = new Date();
        oeqService.getOpenEndedQuestionDate.resolves(fakeDate);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (date) => {
            expect(date).toEqual(fakeDate);
            return res;
        };

        await controller.getOpenEndedQuestionDate(new Types.ObjectId(), res);
    });

    it('getOpenEndedQuestionDate should return NOT_FOUND when service unable to fetch the question date', async () => {
        oeqService.getOpenEndedQuestionDate.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getOpenEndedQuestionDate(new Types.ObjectId(), res);
    });
});
