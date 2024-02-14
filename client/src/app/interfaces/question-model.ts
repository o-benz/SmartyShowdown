import { Types } from 'mongoose';

export interface Choice {
    text: string;
    isCorrect?: boolean | null;
}

export interface BaseQuestion {
    type: TypeEnum;
    text: string;
    points: number;
}

export interface BaseMultipleChoiceQuestion extends BaseQuestion {
    choices: Choice[];
}

export interface BaseLongAnswerQuestion extends BaseQuestion {
    answer: string;
}

export interface Question extends BaseQuestion {
    date: Date;
    _id: Types.ObjectId;
}

export interface MultipleChoiceQuestion extends BaseMultipleChoiceQuestion, Question {}

export interface LongAnswerQuestion extends BaseLongAnswerQuestion, Question {}

export type QuestionModel = MultipleChoiceQuestion | LongAnswerQuestion;

export enum TypeEnum {
    QCM = 'QCM',
    QRL = 'QRL',
}
