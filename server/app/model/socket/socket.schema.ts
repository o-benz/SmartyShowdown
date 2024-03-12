import { GameStats } from '@app/model/stats/stats.schema';

export interface UserSocket {
    data: {
        id?: string;
        username: string;
        room?: string;
        score?: number;
        bonus?: number;
        answered: boolean;
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
