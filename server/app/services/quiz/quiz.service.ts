import { DataBaseQuiz, QuizDocument } from '@app/model/database/quiz-database.schema';
import { Question, Quiz, QuizEnum } from '@app/model/quiz/quiz.schema';
import { GameStats } from '@app/model/stats/stats.schema';
import { SocketService } from '@app/services/socket/socket.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Server, Socket } from 'socket.io';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(DataBaseQuiz.name, 'quizzes')
        private quizModel: Model<QuizDocument>,
        private socket: SocketService,
    ) {}

    async getAllQuiz(): Promise<Quiz[]> {
        try {
            return this.quizModel.find({}, { _id: 0 });
        } catch (error) {
            return Promise.reject('Failed to get quizzes');
        }
    }

    async getQuizById(id: string): Promise<Quiz> {
        try {
            return this.quizModel.findOne({ id }, { _id: 0 });
        } catch (error) {
            return Promise.reject(`Failed to get quiz: ${error}`);
        }
    }

    async checkMCQ(question: Question): Promise<boolean> {
        let countCorrect = 0;
        question.choices.forEach((choice) => {
            if (choice.isCorrect) countCorrect++;
        });

        if (
            countCorrect < 1 ||
            question.choices.length > QuizEnum.MAXCHOICESLENGTH ||
            question.choices.length <= QuizEnum.MINCHOICESLENGTH ||
            question.choices.length - countCorrect < 1
        )
            return false;
        return true;
    }

    async checkQuestionProperties(question: Question): Promise<boolean> {
        if (
            question.text === '' ||
            question.points === null ||
            question.points % QuizEnum.MINPOINTS !== 0 ||
            question.points < QuizEnum.MINPOINTS ||
            question.points > QuizEnum.MAXPOINTS
        )
            return false;
        return true;
    }

    async checkQuestion(question: Question): Promise<boolean> {
        const isPropertiesValid = await this.checkQuestionProperties(question);
        let isQuestionValid = true;
        if (question.type === 'QCM') {
            isQuestionValid = await this.checkMCQ(question);
        }
        return isPropertiesValid && isQuestionValid;
    }

    async addQuiz(quiz: Quiz): Promise<boolean> {
        try {
            const validate = this.validateQuiz(quiz);
            quiz.lastModification = new Date().toISOString();

            if (!validate) {
                return false;
            }

            const existingQuiz = await this.quizModel.findOne({
                $or: [{ id: quiz.id }, { title: quiz.title }],
            });

            if (existingQuiz) {
                if (quiz.id !== existingQuiz.id) {
                    return false;
                } else {
                    await this.quizModel.updateOne({ id: quiz.id }, quiz);
                    return true;
                }
            } else {
                quiz.id = this.generateRandomID(QuizEnum.IDLENGTH);
                const createdQuiz = new this.quizModel(quiz);
                await createdQuiz.save();
                return true;
            }
        } catch (error) {
            return Promise.reject(`Failed to add quiz: ${error}`);
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
        await this.getQuizById(quizID).then((quiz) => {
            stats.duration = quiz.duration;
            stats.name = quiz.title;
            quiz.questions.forEach((question) => {
                if (question.type === 'QCM') {
                    stats.questions.push({
                        title: question.text,
                        type: question.type,
                        points: question.points,
                        statLines: question.choices?.map((choice) => {
                            return { label: choice.text, users: [], isCorrect: choice.isCorrect };
                        }),
                    });
                } else if (question.type === 'QRL') {
                    stats.questions.push({
                        title: question.text,
                        type: question.type,
                        points: question.points,
                        statLines: [
                            { label: 'active', users: [], isCorrect: false },
                            { label: 'inactive', users: [], isCorrect: false },
                        ],
                        pointsGiven: { none: [], half: [], all: [] },
                    });
                }
            });
        });
        return stats;
    }

    async populateGameStatsRandom(server: Server, socket: Socket, quiz: Quiz): Promise<GameStats> {
        const stats: GameStats = {
            id: quiz.id,
            duration: quiz.duration,
            name: quiz.title,
            questions: [],
            users: [],
        };
        const selectedQuestions: Question[] = quiz.questions;
        selectedQuestions.forEach((question) => {
            stats.questions.push({
                title: question.text,
                type: question.type,
                points: question.points,
                statLines:
                    question.choices?.map((choice) => {
                        return { label: choice.text, users: [], isCorrect: choice.isCorrect };
                    }) || [],
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
        try {
            const quiz = await this.quizModel.findOne({ id });
            if (!quiz) {
                throw new NotFoundException(`Quiz with ID ${id} not found`);
            }
            quiz.visible = !quiz.visible;
            await quiz.save();
            return quiz;
        } catch (error) {
            return Promise.reject(`Failed to update quiz visibility: ${error}`);
        }
    }

    async deleteQuiz(id: string): Promise<void> {
        try {
            if ((await this.quizModel.deleteOne({ id })).deletedCount === 0) {
                throw new NotFoundException(`Quiz with ID ${id} not found`);
            }
        } catch (error) {
            return Promise.reject(`Failed to delete quiz: ${error}`);
        }
    }
}
