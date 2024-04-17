import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type OpenEndedQuestionDocument = OpenEndedQuestion & Document;

@Schema()
export class OpenEndedQuestion {
    @ApiProperty()
    @Prop({ required: true })
    date: Date;

    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ type: Types.ObjectId })
    @Prop({ required: true })
    _id: Types.ObjectId;
}

export const openEndedQuestionSchema = SchemaFactory.createForClass(OpenEndedQuestion);
