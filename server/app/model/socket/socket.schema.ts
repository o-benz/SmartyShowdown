import { GameEnum } from '@app/gateways/game/game.gateway.events';
import { GameStats, PlayerState } from '@app/model/stats/stats.schema';

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
        textAnswer?: string;
        state?: PlayerState;
        isMuted?: boolean;
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
    isPaused: boolean;
    delayTick: number;
    timer: unknown;
    startingTime: string;
    socketTimers: Map<string, NodeJS.Timeout>;
    isRandom?: boolean;
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

export interface GameInfo {
    questionIndex: number;
    timeLeft: number;
}

export interface GivePointsInfo {
    pointsGiven: number;
    username: string;
    percentageGiven: string;
    questionIndex: number;
}
