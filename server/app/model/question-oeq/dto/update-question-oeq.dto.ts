import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { OEQ_MAX_POINTS, OEQ_MIN_POINTS, VALID_QUESTION_TYPE } from './question-oeq.dto.constants';

export class UpdateOpenEndedQuestionDto {
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
    text: string;

    @ApiProperty({ minimum: OEQ_MIN_POINTS, maximum: OEQ_MAX_POINTS })
    @IsOptional()
    @IsNumber()
    points: number;

    @ApiProperty()
    _id: Types.ObjectId;
}
