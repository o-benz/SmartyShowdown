import { DateController } from '@app/controllers/date/date.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { DateService } from '@app/services/date/date.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './authGard/constants';
import { JwtStrategy } from './authGard/jwt.strategy';
import { AuthenticationController } from './controllers/admin/admin.controller';
import { GameController } from './controllers/game/game.controller';
import { MultipleChoiceQuestionController } from './controllers/question-mcq/question-mcq.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { MultipleChoiceQuestion, multipleChoiceQuestionSchema } from './model/database/question-mcq';
import { FileManagerService } from './services/file-manager/file-manager.service';
import { GameService } from './services/game/game.service';
import { AdminService } from './services/login/authentication.service';
import { MultipleChoiceQuestionService } from './services/question-mcq/question-mcq.service';
import { QuizService } from './services/quiz/quiz.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule, PassportModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '100m' } })],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '100m' },
        }),
        MongooseModule.forFeature([{ name: MultipleChoiceQuestion.name, schema: multipleChoiceQuestionSchema }]),
    ],
    controllers: [DateController, QuizController, AuthenticationController, GameController, MultipleChoiceQuestionController],
    providers: [
        ChatGateway,
        DateService,
        GameService,
        Logger,
        QuizService,
        FileManagerService,
        AdminService,
        JwtStrategy,
        MultipleChoiceQuestionService,
    ],
})
export class AppModule {}
