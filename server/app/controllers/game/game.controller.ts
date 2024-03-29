import { CorrectionData } from '@app/model/quiz/quiz.schema';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Game')
@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post('/correct')
    @ApiResponse({ status: 201, description: 'Received choice list successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async correct(@Body() requestBody: CorrectionData) {
        const result = this.gameService.correctQuiz(requestBody.clientAnswers, requestBody.questionText, requestBody.quizId);
        return result;
    }
}
