import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { OEQ_MAX_POINTS, OEQ_MIN_POINTS, VALID_QUESTION_TYPE } from './question-oeq.dto.constants';

export class CreateOpenEndedQuestionDto {
    @ApiProperty()
    @IsOptional()
    date: Date;

    @ApiProperty({ default: VALID_QUESTION_TYPE })
    @IsString()
    readonly type: string = VALID_QUESTION_TYPE;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiProperty({ minimum: OEQ_MIN_POINTS, maximum: OEQ_MAX_POINTS })
    @IsNumber()
    points: number;
}
