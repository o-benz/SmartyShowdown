import { Choice, Question } from '@app/model/quiz/quiz.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export type QuizDocument = DataBaseQuiz & Document;

interface DataBaseChoice extends Choice {
    _id?: false;
}

interface DataBaseQuestion extends Question {
    choices?: DataBaseChoice[];
    _id?: false;
}

const questionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    text: { type: String, required: true },
    points: { type: Number, required: true },
    choices: [{ text: String, isCorrect: Boolean, _id: false }],
});

@Schema({ versionKey: false })
export class DataBaseQuiz {
    @ApiProperty()
    @Prop({ required: true })
    id: string;

    @ApiProperty()
    @Prop({ required: true })
    visible: boolean;

    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    duration: number;

    @ApiProperty()
    @Prop({ required: true })
    lastModification: string;

    @ApiProperty({ type: [questionSchema] })
    @Prop({ type: [questionSchema], required: true, _id: false })
    questions: DataBaseQuestion[];
}

export const quizSchema = SchemaFactory.createForClass(DataBaseQuiz);
