import { Question, Quiz } from '@app/model/quiz/quiz.schema';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return list of quiz',
    })
    async allQuiz() {
        return this.quizService.getAllQuiz();
    }

    @Get('/:id')
    @ApiOkResponse({
        description: 'Return a specific quiz based on its ID',
    })
    @ApiNotFoundResponse({
        description: 'Quiz not found',
    })
    async getQuizById(@Param('id') id: string) {
        const quiz = await this.quizService.getQuizById(id);
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        return quiz;
    }

    @Post('/valid/question')
    @ApiOkResponse({
        description: 'Add a question to a quiz',
    })
    @ApiNotFoundResponse({
        description: 'Question is not valid',
    })
    async addQuestionToQuiz(@Body() question: Question) {
        return this.quizService.checkQuestion(question);
    }

    @Post('/')
    @ApiOkResponse({
        description: 'Add quiz to the quizlist',
    })
    @ApiNotFoundResponse({
        description: 'Quiz not valid',
    })
    async addQuiz(@Body() quiz: Quiz) {
        return this.quizService.addQuiz(quiz);
    }

    @Put('/:id')
    @ApiOkResponse({
        description: 'Quiz successfully updated',
    })
    @ApiNotFoundResponse({
        description: 'Quiz not found',
    })
    async updateQuiz(@Param('id') id: string) {
        const quiz = await this.quizService.getQuizById(id);
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        return this.quizService.updateQuizVisibility(id);
    }

    @Delete('/:id')
    @ApiOkResponse({
        description: 'Quiz successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Quiz not found',
    })
    async deleteQuiz(@Param('id') id: string) {
        const quiz = await this.quizService.getQuizById(id);
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        await this.quizService.deleteQuiz(id);
        return { message: 'Quiz successfully deleted' };
    }
}
