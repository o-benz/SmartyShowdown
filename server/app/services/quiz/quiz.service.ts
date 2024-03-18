import { Question, Quiz, QuizEnum } from '@app/model/quiz/quiz.schema';
import { Answers } from '@app/model/socket/socket.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { FileManagerService } from '@app/services/file-manager/file-manager.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { Server, Socket } from 'socket.io';

const NOTFOUND = -1;
const QUIZ_DEFAULT_PATH = '/../../../../assets/quiz-example.json';

@Injectable()
export class QuizService {
    path: string = join(__dirname, QUIZ_DEFAULT_PATH);
    constructor(
        private fileManager: FileManagerService,
        private socket: SocketService,
    ) {}

    async getAllQuiz(): Promise<Quiz[]> {
        return JSON.parse(await this.fileManager.readCustomFile(this.path));
    }

    async getQuizById(id: string): Promise<Quiz> {
        const quizList = await this.getAllQuiz();
        return quizList.find((quiz) => quiz.id === id) || null;
    }

    async checkQuestion(question: Question): Promise<boolean> {
        let countCorrect = 0;
        question.choices.forEach((choice) => {
            if (choice.isCorrect) countCorrect++;
        });

        if (
            question.text === '' ||
            question.points === null ||
            countCorrect < 1 ||
            question.choices.length > QuizEnum.MAXCHOICESLENGTH ||
            question.choices.length <= QuizEnum.MINCHOICESLENGTH ||
            question.choices.length - countCorrect < 1 ||
            question.points % QuizEnum.MINPOINTS !== 0 ||
            question.points < QuizEnum.MINPOINTS ||
            question.points > QuizEnum.MAXPOINTS
        )
            return false;
        return true;
    }

    async addQuiz(quiz: Quiz): Promise<boolean> {
        const quizList = await this.getAllQuiz();
        const validate = this.validateQuiz(quiz);
        const alreadyExist = quizList.find((item) => item.id === quiz.id);

        quiz.lastModification = new Date().toISOString();

        if (validate && alreadyExist) {
            const index = quizList.findIndex((item) => item.id === quiz.id);
            quizList[index] = quiz;
            await this.fileManager.writeCustomFile(this.path, JSON.stringify(quizList, null, 2));
            return true;
        } else if (validate) {
            quiz.id = this.generateRandomID(QuizEnum.IDLENGTH);
            quizList.push(quiz);
            await this.fileManager.writeCustomFile(this.path, JSON.stringify(quizList, null, 2));
            return true;
        } else {
            return false;
        }
    }

    async populateGameStats(server: Server, socket: Socket, quizID: string): Promise<GameStats> {
        const stats: GameStats = {
            id: quizID,
            duration: 0,
            questions: [],
            users: [],
            name: '',
        };
        this.getQuizById(quizID).then((quiz) => {
            stats.duration = quiz.duration;
            stats.name = quiz.title;
            quiz.questions.forEach((question) => {
                stats.questions.push({
                    title: question.text,
                    type: question.type,
                    points: question.points,
                    statLines: question.choices?.map((choice) => {
                        return { label: choice.text, users: [], isCorrect: choice.isCorrect };
                    }),
                });
            });
        });
        return stats;
    }

    validateQuiz(quiz: Quiz): boolean {
        if (quiz.title === '' || quiz.description === '' || quiz.questions.length < 1) return false;
        return true;
    }

    generateRandomID(len: number) {
        const hex = QuizEnum.IDHEX;
        let output = '';
        for (let i = 0; i < len; ++i) {
            output += hex.charAt(Math.floor(Math.random() * hex.length));
        }
        return output;
    }

    async updateQuizVisibility(id: string): Promise<Quiz> {
        const quiz = await this.getQuizById(id);
        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }
        quiz.visible = !quiz.visible;

        const quizList = await this.getAllQuiz();
        const index = quizList.findIndex((item) => item.id === quiz.id);
        if (index !== NOTFOUND) {
            quizList[index] = quiz;
        } else {
            throw new NotFoundException(`Quiz with ID ${id} not found in the list`);
        }

        await this.fileManager.writeCustomFile(this.path, JSON.stringify(quizList, null, 2));
        return quiz;
    }

    async deleteQuiz(id: string): Promise<void> {
        const quiz = await this.getQuizById(id);
        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }
        quiz.visible = !quiz.visible;

        const quizList = await this.getAllQuiz();
        const index = quizList.findIndex((item) => item.id === quiz.id);
        if (index !== NOTFOUND) {
            quizList.splice(index, 1);
        } else {
            throw new NotFoundException(`Quiz with ID ${id} not found in the list`);
        }

        await this.fileManager.writeCustomFile(this.path, JSON.stringify(quizList, null, 2));
    }

    validateAnswer(socket: Socket, answer: Answers, gameStats: GameStats): boolean {
        const correctStatLines = gameStats.questions[answer.questionIndex].statLines;
        correctStatLines.forEach((line) => {
            if (line.isCorrect && !answer.answers.find((choice) => choice.text === line.label)) {
                return false;
            }
        });
        return true;
    }
}
