import { MultipleChoiceQuestion } from '@app/model/database/question-mcq';
import { CreateMultipleChoiceQuestionDto } from '@app/model/dto/question-mcq/create-question-mcq.dto';
import { UpdateMultipleChoiceQuestionDto } from '@app/model/dto/question-mcq/update-question-mcq.dto';
import { MultipleChoiceQuestionService } from '@app/services/question-mcq/question-mcq.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';

@ApiTags('Question-MCQ')
@Controller('question-mcq')
export class MultipleChoiceQuestionController {
    constructor(private readonly multipleChoiceQuestionService: MultipleChoiceQuestionService) {}

    @ApiOkResponse({
        description: 'Return all multiple choice questions',
        type: MultipleChoiceQuestion,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allMultipleChoiceQuestion(@Res() response: Response) {
        try {
            const allMultipleChoiceQuestions = await this.multipleChoiceQuestionService.getAllMultipleChoiceQuestions();
            response.status(HttpStatus.OK).json(allMultipleChoiceQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get multiple choice question by question text',
        type: MultipleChoiceQuestion,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId')
    async multipleChoiceQuestion(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const course = await this.multipleChoiceQuestionService.getMultipleChoiceQuestion(id);
            response.status(HttpStatus.OK).json(course);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add a new multiple choice question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Post('/')
    async addMultipleChoiceQuestion(@Body() questionDto: CreateMultipleChoiceQuestionDto, @Res() response: Response) {
        try {
            await this.multipleChoiceQuestionService.addMultipleChoiceQuestion(questionDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a multiple choice question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Delete('/:questionId')
    async deleteMultipleChoiceQuestion(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            await this.multipleChoiceQuestionService.deleteMultipleChoiceQuestion(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a multiple choice question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Patch('/')
    async modifyMultipleChoiceQuestion(@Body() questionDto: UpdateMultipleChoiceQuestionDto, @Res() response: Response) {
        try {
            // eslint-disable-next-line no-underscore-dangle
            questionDto._id = new Types.ObjectId(questionDto._id);
            // eslint-disable-next-line no-underscore-dangle
            await this.multipleChoiceQuestionService.updateMultipleChoiceQuestion(questionDto._id, questionDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Return a question choices',
        type: Array,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId/choices')
    async getMultipleChoiceQuestionChoices(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const choices = await this.multipleChoiceQuestionService.getMultipleChoiceQuestionChoices(id);
            response.status(HttpStatus.OK).json(choices);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Return a question points',
        type: Number,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId/points')
    async getMultipleChoiceQuestionPoints(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const points = await this.multipleChoiceQuestionService.getMultipleChoiceQuestionPoints(id);
            response.status(HttpStatus.OK).json(points);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Return a question type',
        type: String,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId/type')
    async getMultipleChoiceQuestionType(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const type = await this.multipleChoiceQuestionService.getMultipleChoiceQuestionType(id);
            response.status(HttpStatus.OK).json(type);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Return a question date',
        type: String,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId/date')
    async getMultipleChoiceQuestionDate(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const date = await this.multipleChoiceQuestionService.getMultipleChoiceQuestionDate(id);
            response.status(HttpStatus.OK).json(date);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
