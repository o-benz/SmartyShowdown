import { Choice } from '@app/model/quiz/quiz.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { MCQ_MAX_CHOICES, MCQ_MAX_POINTS, MCQ_MIN_CHOICES, MCQ_MIN_POINTS, VALID_QUESTION_TYPE } from './question-mcq.dto.constants';

export class CreateMultipleChoiceQuestionDto {
    @ApiProperty()
    @IsOptional()
    date: Date;

    @ApiProperty({ default: VALID_QUESTION_TYPE })
    @IsString()
    readonly type: string = VALID_QUESTION_TYPE;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiProperty({ minimum: MCQ_MIN_POINTS, maximum: MCQ_MAX_POINTS })
    @IsNumber()
    points: number;

    @ApiProperty({ maxLength: MCQ_MAX_CHOICES, minLength: MCQ_MIN_CHOICES })
    @IsArray()
    @ArrayMinSize(MCQ_MIN_CHOICES)
    @ArrayMaxSize(MCQ_MAX_CHOICES)
    choices: Choice[];
}
