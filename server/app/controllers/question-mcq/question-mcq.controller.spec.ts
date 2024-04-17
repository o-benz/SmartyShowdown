import { MultipleChoiceQuestion } from '@app/model/database/question-mcq-database.schema';
import { MultipleChoiceQuestionService } from '@app/services/question-mcq/question-mcq.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Types } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MultipleChoiceQuestionController } from './question-mcq.controller';

describe('QuestionController', () => {
    let controller: MultipleChoiceQuestionController;
    let mcqService: SinonStubbedInstance<MultipleChoiceQuestionService>;

    beforeEach(async () => {
        mcqService = createStubInstance(MultipleChoiceQuestionService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MultipleChoiceQuestionController],
            providers: [
                {
                    provide: MultipleChoiceQuestionService,
                    useValue: mcqService,
                },
            ],
        }).compile();

        controller = module.get<MultipleChoiceQuestionController>(MultipleChoiceQuestionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allMultipleChoiceQuestion() should return all multiple choice questions', async () => {
        const fakeQuestions = [new MultipleChoiceQuestion(), new MultipleChoiceQuestion()];
        mcqService.getAllMultipleChoiceQuestions.resolves(fakeQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (questions) => {
            expect(questions).toEqual(fakeQuestions);
            return res;
        };

        await controller.allMultipleChoiceQuestion(res);
    });

    it('allMultipleChoiceQuestion() should return NOT_FOUND when service unable to fetch questions', async () => {
        mcqService.getAllMultipleChoiceQuestions.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allMultipleChoiceQuestion(res);
    });

    it('multipleChoiceQuestion() should return question by question _id', async () => {
        const fakeQuestion = new MultipleChoiceQuestion();
        mcqService.getMultipleChoiceQuestion.resolves(fakeQuestion);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(fakeQuestion);
            return res;
        };

        await controller.multipleChoiceQuestion(new Types.ObjectId(), res);
    });

    it('multipleChoiceQuestion() should return NOT_FOUND when service unable to fetch the question', async () => {
        mcqService.getMultipleChoiceQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.multipleChoiceQuestion(new Types.ObjectId(), res);
    });

    it('addMultipleChoiceQuestion() should add new question', async () => {
        mcqService.addMultipleChoiceQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addMultipleChoiceQuestion(new MultipleChoiceQuestion(), res);
    });

    it('multipleChoiceQuestion() should not work when trying to add a question with a date', async () => {
        const fakeQuestion = new MultipleChoiceQuestion();
        fakeQuestion.date = new Date();
        mcqService.addMultipleChoiceQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addMultipleChoiceQuestion(fakeQuestion, res);
    });

    it('addMultipleChoiceQuestion should not work when trying to add a question with a type', async () => {
        const fakeQuestion = new MultipleChoiceQuestion();
        fakeQuestion.type = 'type';
        mcqService.addMultipleChoiceQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addMultipleChoiceQuestion(fakeQuestion, res);
    });

    it('addMultipleChoiceQuestion() should return NOT_FOUND when service unable to add the question', async () => {
        mcqService.addMultipleChoiceQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addMultipleChoiceQuestion(new MultipleChoiceQuestion(), res);
    });

    it('deleteMultipleChoiceQuestion() should delete question', async () => {
        mcqService.deleteMultipleChoiceQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteMultipleChoiceQuestion(new Types.ObjectId(), res);
    });

    it('deleteMultipleChoiceQuestion() should return NOT_FOUND when service unable to delete the question', async () => {
        mcqService.deleteMultipleChoiceQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.deleteMultipleChoiceQuestion(new Types.ObjectId(), res);
    });

    it('modifyMultipleChoiceQuestion() should modify question', async () => {
        mcqService.updateMultipleChoiceQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyMultipleChoiceQuestion(new MultipleChoiceQuestion(), res);
    });

    it('modifyMultipleChoiceQuestion() should return NOT_FOUND when service unable to modify the question', async () => {
        mcqService.updateMultipleChoiceQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.modifyMultipleChoiceQuestion(new MultipleChoiceQuestion(), res);
    });

    it('getMultipleChoiceQuestionChoices() should return question choices', async () => {
        const fakeChoices = [{ text: 'choice1' }, { text: 'choice2' }];
        mcqService.getMultipleChoiceQuestionChoices.resolves(fakeChoices);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (choices) => {
            expect(choices).toEqual(fakeChoices);
            return res;
        };

        await controller.getMultipleChoiceQuestionChoices(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionChoices() should return NOT_FOUND when service unable to fetch the question choices', async () => {
        mcqService.getMultipleChoiceQuestionChoices.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMultipleChoiceQuestionChoices(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionPoints() should return question points', async () => {
        const fakePoints = 10;
        mcqService.getMultipleChoiceQuestionPoints.resolves(fakePoints);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (points) => {
            expect(points).toEqual(fakePoints);
            return res;
        };

        await controller.getMultipleChoiceQuestionPoints(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionPoints() should return NOT_FOUND when service unable to fetch the question points', async () => {
        mcqService.getMultipleChoiceQuestionPoints.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMultipleChoiceQuestionPoints(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionType() should return question type', async () => {
        const fakeType = 'type';
        mcqService.getMultipleChoiceQuestionType.resolves(fakeType);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (type) => {
            expect(type).toEqual(fakeType);
            return res;
        };

        await controller.getMultipleChoiceQuestionType(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionType() should return NOT_FOUND when service unable to fetch the question type', async () => {
        mcqService.getMultipleChoiceQuestionType.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMultipleChoiceQuestionType(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionDate() should return question date', async () => {
        const fakeDate = new Date();
        mcqService.getMultipleChoiceQuestionDate.resolves(fakeDate);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (date) => {
            expect(date).toEqual(fakeDate);
            return res;
        };

        await controller.getMultipleChoiceQuestionDate(new Types.ObjectId(), res);
    });

    it('getMultipleChoiceQuestionDate() should return NOT_FOUND when service unable to fetch the question date', async () => {
        mcqService.getMultipleChoiceQuestionDate.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getMultipleChoiceQuestionDate(new Types.ObjectId(), res);
    });
});
