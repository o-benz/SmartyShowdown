import { OpenEndedQuestion } from '@app/model/database/question-oeq-database.schema';
import { CreateOpenEndedQuestionDto } from '@app/model/question-oeq/dto/create-question-oeq.dto';
import { UpdateOpenEndedQuestionDto } from '@app/model/question-oeq/dto/update-question-oeq.dto';
import { OpenEndedQuestionService } from '@app/services/question-oeq/question-oeq.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';

@ApiTags('Question-OEQ')
@Controller('question-oeq')
export class OpenEndedQuestionController {
    constructor(private readonly openEndedQuestionService: OpenEndedQuestionService) {}

    @ApiOkResponse({
        description: 'Return all open-ended questions',
        type: OpenEndedQuestion,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allOpenEndedQuestion(@Res() response: Response) {
        try {
            const allOpenEndedQuestions = await this.openEndedQuestionService.getAllOpenEndedQuestions();
            response.status(HttpStatus.OK).json(allOpenEndedQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
        }
    }

    @ApiOkResponse({
        description: 'Get open-ended question by question text',
        type: OpenEndedQuestion,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:questionId')
    async openEndedQuestion(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const course = await this.openEndedQuestionService.getOpenEndedQuestion(id);
            response.status(HttpStatus.OK).json(course);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
        }
    }

    @ApiCreatedResponse({
        description: 'Add a new open-ended question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Post('/')
    async addOpenEndedQuestion(@Body() questionDto: CreateOpenEndedQuestionDto, @Res() response: Response) {
        try {
            await this.openEndedQuestionService.addOpenEndedQuestion(questionDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error);
        }
    }

    @ApiOkResponse({
        description: 'Delete a open-ended question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Delete('/:questionId')
    async deleteOpenEndedQuestion(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            await this.openEndedQuestionService.deleteOpenEndedQuestion(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error);
        }
    }

    @ApiOkResponse({
        description: 'Modify a open-ended question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Patch('/')
    async modifyOpenEndedQuestion(@Body() questionDto: UpdateOpenEndedQuestionDto, @Res() response: Response) {
        try {
            // eslint-disable-next-line no-underscore-dangle
            questionDto._id = new Types.ObjectId(questionDto._id);
            // eslint-disable-next-line no-underscore-dangle
            await this.openEndedQuestionService.updateOpenEndedQuestion(questionDto._id, questionDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error);
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
    async getOpenEndedQuestionPoints(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const points = await this.openEndedQuestionService.getOpenEndedQuestionPoints(id);
            response.status(HttpStatus.OK).json(points);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
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
    async getOpenEndedQuestionType(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const type = await this.openEndedQuestionService.getOpenEndedQuestionType(id);
            response.status(HttpStatus.OK).json(type);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
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
    async getOpenEndedQuestionDate(@Param('questionId') id: Types.ObjectId, @Res() response: Response) {
        try {
            id = new Types.ObjectId(id);
            const date = await this.openEndedQuestionService.getOpenEndedQuestionDate(id);
            response.status(HttpStatus.OK).json(date);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
        }
    }
}
