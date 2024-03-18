import { GameEnum } from '@app/gateways/game/game.gateway.events';
import { Choice } from '@app/model/quiz/quiz.schema';
import { GameStats } from '@app/model/stats/stats.schema';

export interface UserSocket {
    data: {
        id?: string;
        username?: string;
        room?: string;
        score?: number;
        bonus?: number;
        answered: boolean;
        firstToAnswer?: boolean;
        hasLeft?: boolean;
    };
}

export const FAKE_USERSOCKET = {
    data: {
        username: 'name',
    },
};

export interface Room {
    roomMessages: string[];
    isOpen: boolean;
    bannedUsers: string[];
    gameStats: GameStats;
    isStarted: boolean;
}

export interface SocketAnswer {
    joined: boolean;
    message?: GameEnum;
    gameStats?: GameStats;
}

export interface Answer {
    answer: number;
    questionIndex: number;
}

export interface Answers {
    answers: Choice[];
    questionIndex: number;
}
