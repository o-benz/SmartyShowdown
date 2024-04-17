import { historicGameSchema } from '@app/model/historic/historic.schema';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './authGard/constants';
import { JwtStrategy } from './authGard/jwt.strategy';
import { AuthenticationController } from './controllers/admin/admin.controller';
import { GameController } from './controllers/game/game.controller';
import { HistoricController } from './controllers/historic/historic.controller';
import { MultipleChoiceQuestionController } from './controllers/question-mcq/question-mcq.controller';
import { OpenEndedQuestionController } from './controllers/question-oeq/question-oeq.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { MultipleChoiceQuestion, multipleChoiceQuestionSchema } from './model/database/question-mcq-database.schema';
import { OpenEndedQuestion, openEndedQuestionSchema } from './model/database/question-oeq-database.schema';
import { DataBaseQuiz, quizSchema } from './model/database/quiz-database.schema';
import { FileManagerService } from './services/file-manager/file-manager.service';
import { GameService } from './services/game/game.service';
import { HistoricService } from './services/historic-manager/historic.service';
import { AdminService } from './services/login/authentication.service';
import { MultipleChoiceQuestionService } from './services/question-mcq/question-mcq.service';
import { OpenEndedQuestionService } from './services/question-oeq/question-oeq.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';
import { SocketGameManagerService } from './services/socket-game-manager/socket-game-manager.service';
import { SocketTimeManagerService } from './services/socket-time-manager/socket-time-manager.service';
import { SocketService } from './services/socket/socket.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            connectionName: 'questions',
            imports: [ConfigModule, PassportModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '100m' } })],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_QUESTIONS_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forRootAsync({
            connectionName: 'games',
            imports: [ConfigModule, PassportModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '100m' } })],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_GAMES_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forRootAsync({
            connectionName: 'quizzes',
            imports: [ConfigModule, PassportModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '100m' } })],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_QUIZZES_CONNECTION_STRING'),
            }),
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '100m' },
        }),
        MongooseModule.forFeature([{ name: MultipleChoiceQuestion.name, schema: multipleChoiceQuestionSchema }], 'questions'),
        MongooseModule.forFeature([{ name: OpenEndedQuestion.name, schema: openEndedQuestionSchema }], 'questions'),
        MongooseModule.forFeature([{ name: 'HistoricGame', schema: historicGameSchema }], 'games'),
        MongooseModule.forFeature([{ name: DataBaseQuiz.name, schema: quizSchema }], 'quizzes'),
    ],
    controllers: [
        QuizController,
        AuthenticationController,
        GameController,
        MultipleChoiceQuestionController,
        HistoricController,
        OpenEndedQuestionController,
    ],
    providers: [
        GameService,
        Logger,
        QuizService,
        FileManagerService,
        AdminService,
        JwtStrategy,
        MultipleChoiceQuestionService,
        GameGateway,
        SocketService,
        SocketGameManagerService,
        SocketTimeManagerService,
        HistoricService,
        OpenEndedQuestionService,
        QuestionService,
    ],
})
export class AppModule {}
