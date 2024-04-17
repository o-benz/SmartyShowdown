import { MultipleChoiceQuestion, MultipleChoiceQuestionDocument } from '@app/model/database/question-mcq-database.schema';
import { OpenEndedQuestion, OpenEndedQuestionDocument } from '@app/model/database/question-oeq-database.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(OpenEndedQuestion.name, 'questions')
        public openEndedQuestionModel: Model<OpenEndedQuestionDocument>,
        @InjectModel(MultipleChoiceQuestion.name, 'questions')
        public multipleChoiceQuestionModel: Model<MultipleChoiceQuestionDocument>,
    ) {}

    async isQuestionTextInUse(questionText: string): Promise<OpenEndedQuestion | MultipleChoiceQuestion> {
        const openEndedQuestion = await this.openEndedQuestionModel.findOne({ text: questionText });
        if (openEndedQuestion) {
            return openEndedQuestion;
        }

        return this.multipleChoiceQuestionModel.findOne({ text: questionText });
    }
}
