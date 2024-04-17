import { MultipleChoiceQuestion, MultipleChoiceQuestionDocument } from '@app/model/database/question-mcq-database.schema';
import { CreateMultipleChoiceQuestionDto } from '@app/model/question-mcq/dto/create-question-mcq.dto';
import { UpdateMultipleChoiceQuestionDto } from '@app/model/question-mcq/dto/update-question-mcq.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    MAXIMUM_NUMBER_OF_CHOICES,
    MAXIMUM_NUMBER_OF_POINTS,
    MINIMUM_NUMBER_OF_CHOICES,
    MINIMUM_NUMBER_OF_POINTS,
    MULTIPLE_IDENTIFIER,
    VALID_QUESTION_TYPE,
} from './question-mcq.service.constants';

@Injectable()
export class MultipleChoiceQuestionService {
    constructor(
        @InjectModel(MultipleChoiceQuestion.name, 'questions')
        public multipleChoiceQuestionModel: Model<MultipleChoiceQuestionDocument>,
        private questionService: QuestionService,
    ) {}

    async getAllMultipleChoiceQuestions(): Promise<MultipleChoiceQuestion[]> {
        try {
            return this.multipleChoiceQuestionModel.find();
        } catch (error) {
            return Promise.reject('Failed to get questions');
        }
    }

    async getMultipleChoiceQuestion(id: Types.ObjectId): Promise<MultipleChoiceQuestion> {
        try {
            return this.multipleChoiceQuestionModel.findOne({ _id: id });
        } catch (error) {
            return Promise.reject(`Failed to get question: ${error}`);
        }
    }

    async addMultipleChoiceQuestion(question: CreateMultipleChoiceQuestionDto): Promise<void> {
        try {
            await this.validateQuestion(question);
            await this.multipleChoiceQuestionModel.create({ ...question, type: VALID_QUESTION_TYPE, date: new Date(), _id: new Types.ObjectId() });
        } catch (error) {
            if (error.message.includes('Invalid question format') || error.message.includes('Question already exists')) {
                return Promise.reject(`invalid question: ${error}`);
            } else {
                return Promise.reject(`Failed to add question: ${error}`);
            }
        }
    }

    async deleteMultipleChoiceQuestion(id: Types.ObjectId): Promise<void> {
        try {
            if ((await this.multipleChoiceQuestionModel.deleteOne({ _id: id })).deletedCount === 0) {
                return Promise.reject('Question not found');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async updateMultipleChoiceQuestion(id: Types.ObjectId, question: UpdateMultipleChoiceQuestionDto): Promise<void> {
        const filterQuery = { _id: id };
        try {
            await this.validateQuestion(question);
            const updatedQuestion = { ...question, type: VALID_QUESTION_TYPE, date: new Date() };
            // eslint-disable-next-line no-underscore-dangle
            delete updatedQuestion._id;
            if ((await this.multipleChoiceQuestionModel.updateOne(filterQuery, updatedQuestion)).matchedCount === 0) {
                return Promise.reject('Question not found');
            }
        } catch (error) {
            return Promise.reject(`invalid question: ${error}`);
        }
    }

    async getMultipleChoiceQuestionChoices(id: Types.ObjectId): Promise<{ text: string; isCorrect?: boolean }[]> {
        const filterQuery = { _id: id };
        try {
            const result = await this.multipleChoiceQuestionModel.findOne(filterQuery, { choices: 1 });
            return result.choices;
        } catch (error) {
            return Promise.reject(`Failed to get choices: ${error}`);
        }
    }

    async getMultipleChoiceQuestionPoints(id: Types.ObjectId): Promise<number> {
        const filterQuery = { _id: id };
        try {
            const result = await this.multipleChoiceQuestionModel.findOne(filterQuery, { points: 1 });
            return result.points;
        } catch (error) {
            return Promise.reject(`Failed to get points: ${error}`);
        }
    }

    async getMultipleChoiceQuestionType(id: Types.ObjectId): Promise<string> {
        const filterQuery = { _id: id };
        try {
            const result = await this.multipleChoiceQuestionModel.findOne(filterQuery, { type: 1 });
            return result.type;
        } catch (error) {
            return Promise.reject(`Failed to get type: ${error}`);
        }
    }

    async getMultipleChoiceQuestionDate(id: Types.ObjectId): Promise<Date> {
        const filterQuery = { _id: id };
        try {
            const result = await this.multipleChoiceQuestionModel.findOne(filterQuery, { date: 1 });
            return result.date;
        } catch (error) {
            return Promise.reject(`Failed to get date: ${error}`);
        }
    }

    private async validateQuestion(question): Promise<boolean> {
        if (!this.validateMultipleChoiceQuestionFormat(question)) {
            return Promise.reject(new Error('Invalid question format'));
        }
        const existingQuestion = await this.questionService.isQuestionTextInUse(question.text);
        // eslint-disable-next-line no-underscore-dangle
        if (existingQuestion && !existingQuestion._id.equals(question._id)) {
            return Promise.reject(new Error('Question already exists'));
        }
        return true;
    }

    private validateMultipleChoiceQuestionFormat(question: CreateMultipleChoiceQuestionDto): boolean {
        return (
            this.validateMultipleChoiceQuestionType(question.type) &&
            this.validateMultipleChoiceQuestionPoints(question.points) &&
            this.validateMultipleChoiceQuestionChoices(question.choices)
        );
    }

    private validateMultipleChoiceQuestionType(type: string): boolean {
        return type === VALID_QUESTION_TYPE;
    }

    private validateMultipleChoiceQuestionPoints(points: number): boolean {
        return points >= MINIMUM_NUMBER_OF_POINTS && points <= MAXIMUM_NUMBER_OF_POINTS && points % MULTIPLE_IDENTIFIER === 0;
    }

    private validateMultipleChoiceQuestionChoices(choices: { text: string; isCorrect?: boolean }[]): boolean {
        return (
            choices.length >= MINIMUM_NUMBER_OF_CHOICES &&
            choices.length <= MAXIMUM_NUMBER_OF_CHOICES &&
            choices.every((choice) => choice.text !== '') &&
            choices.some((choice) => choice.isCorrect) &&
            choices.some((choice) => !choice.isCorrect)
        );
    }
}
