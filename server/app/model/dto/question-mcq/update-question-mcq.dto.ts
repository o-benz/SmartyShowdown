import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { MCQ_MAX_CHOICES, MCQ_MAX_POINTS, MCQ_MIN_CHOICES, MCQ_MIN_POINTS, VALID_QUESTION_TYPE } from './question-mcq.dto.constants';

export class UpdateMultipleChoiceQuestionDto {
    @ApiProperty()
    @IsDate()
    @IsOptional()
    readonly date: Date;

    @ApiProperty({ default: VALID_QUESTION_TYPE })
    @IsString()
    readonly type: string = VALID_QUESTION_TYPE;

    @ApiProperty()
    @IsOptional()
    @IsString()
    question: string;

    @ApiProperty({ minimum: MCQ_MIN_POINTS, maximum: MCQ_MAX_POINTS })
    @IsOptional()
    @IsNumber()
    points: number;

    @ApiProperty({ maxLength: MCQ_MAX_CHOICES, minLength: MCQ_MIN_CHOICES })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(MCQ_MIN_CHOICES)
    @ArrayMaxSize(MCQ_MAX_CHOICES)
    choices: { text: string; isCorrect?: boolean }[];

    @ApiProperty()
    _id: Types.ObjectId;
}
