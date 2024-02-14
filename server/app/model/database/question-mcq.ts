import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type MultipleChoiceQuestionDocument = MultipleChoiceQuestion & Document;

export interface Choice {
    text: string;
    isCorrect?: boolean | null;
    _id?: false;
}
@Schema()
export class MultipleChoiceQuestion {
    @ApiProperty()
    @Prop({ required: true })
    date: Date;

    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    question: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop([{ text: String, isCorrect: Boolean || null, _id: false }])
    @Prop({ required: true })
    choices: Choice[];

    @ApiProperty()
    @Prop({ type: Types.ObjectId })
    @Prop({ required: true })
    _id: Types.ObjectId;
}

export const multipleChoiceQuestionSchema = SchemaFactory.createForClass(MultipleChoiceQuestion);
