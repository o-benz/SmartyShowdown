import { OpenEndedQuestion, OpenEndedQuestionDocument } from '@app/model/database/question-oeq-database.schema';
import { CreateOpenEndedQuestionDto } from '@app/model/question-oeq/dto/create-question-oeq.dto';
import { OEQ_MAX_POINTS, OEQ_MIN_POINTS, VALID_QUESTION_TYPE } from '@app/model/question-oeq/dto/question-oeq.dto.constants';
import { UpdateOpenEndedQuestionDto } from '@app/model/question-oeq/dto/update-question-oeq.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

const MULTIPLE_IDENTIFIER = 10;

@Injectable()
export class OpenEndedQuestionService {
    constructor(
        @InjectModel(OpenEndedQuestion.name, 'questions')
        public openEndedQuestionModel: Model<OpenEndedQuestionDocument>,
        private questionService: QuestionService,
    ) {}

    async getAllOpenEndedQuestions(): Promise<OpenEndedQuestion[]> {
        try {
            return this.openEndedQuestionModel.find();
        } catch (error) {
            return Promise.reject('Failed to get questions');
        }
    }

    async getOpenEndedQuestion(id: Types.ObjectId): Promise<OpenEndedQuestion> {
        try {
            return this.openEndedQuestionModel.findOne({ _id: id });
        } catch (error) {
            return Promise.reject(`Failed to get question: ${error}`);
        }
    }

    async addOpenEndedQuestion(question: CreateOpenEndedQuestionDto): Promise<void> {
        try {
            await this.validateQuestion(question);
            await this.openEndedQuestionModel.create({ ...question, type: VALID_QUESTION_TYPE, date: new Date(), _id: new Types.ObjectId() });
        } catch (error) {
            if (error.message.includes('Invalid question format') || error.message.includes('Question already exists')) {
                return Promise.reject(`invalid question: ${error}`);
            } else {
                return Promise.reject(`Failed to add question: ${error}`);
            }
        }
    }

    async deleteOpenEndedQuestion(id: Types.ObjectId): Promise<void> {
        try {
            if ((await this.openEndedQuestionModel.deleteOne({ _id: id })).deletedCount === 0) {
                return Promise.reject('Question not found');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async updateOpenEndedQuestion(id: Types.ObjectId, question: UpdateOpenEndedQuestionDto): Promise<void> {
        const filterQuery = { _id: id };
        try {
            await this.validateQuestion(question);
            const updatedQuestion = { ...question, type: VALID_QUESTION_TYPE, date: new Date() };
            // eslint-disable-next-line no-underscore-dangle
            delete updatedQuestion._id;
            if ((await this.openEndedQuestionModel.updateOne(filterQuery, updatedQuestion)).matchedCount === 0) {
                return Promise.reject('Question not found');
            }
        } catch (error) {
            return Promise.reject(`invalid question: ${error}`);
        }
    }

    async getOpenEndedQuestionPoints(id: Types.ObjectId): Promise<number> {
        const filterQuery = { _id: id };
        try {
            const result = await this.openEndedQuestionModel.findOne(filterQuery, { points: 1 });
            return result.points;
        } catch (error) {
            return Promise.reject(`Failed to get points: ${error}`);
        }
    }

    async getOpenEndedQuestionType(id: Types.ObjectId): Promise<string> {
        const filterQuery = { _id: id };
        try {
            const result = await this.openEndedQuestionModel.findOne(filterQuery, { type: 1 });
            return result.type;
        } catch (error) {
            return Promise.reject(`Failed to get type: ${error}`);
        }
    }

    async getOpenEndedQuestionDate(id: Types.ObjectId): Promise<Date> {
        const filterQuery = { _id: id };
        try {
            const result = await this.openEndedQuestionModel.findOne(filterQuery, { date: 1 });
            return result.date;
        } catch (error) {
            return Promise.reject(`Failed to get date: ${error}`);
        }
    }

    private async validateQuestion(question): Promise<boolean> {
        if (!this.validateOpenEndedQuestionFormat(question)) {
            return Promise.reject(new Error('Invalid question format'));
        }
        const existingQuestion = await this.questionService.isQuestionTextInUse(question.text);
        // eslint-disable-next-line no-underscore-dangle
        if (existingQuestion && !existingQuestion._id.equals(question._id)) {
            return Promise.reject(new Error('Question already exists'));
        }
        return true;
    }

    private validateOpenEndedQuestionFormat(question: CreateOpenEndedQuestionDto): boolean {
        return this.validateMultipleChoiceQuestionType(question.type) && this.validateOpenEndedQuestionPoints(question.points);
    }

    private validateMultipleChoiceQuestionType(type: string): boolean {
        return type === VALID_QUESTION_TYPE;
    }

    private validateOpenEndedQuestionPoints(points: number): boolean {
        return points >= OEQ_MIN_POINTS && points <= OEQ_MAX_POINTS && points % MULTIPLE_IDENTIFIER === 0;
    }
}
