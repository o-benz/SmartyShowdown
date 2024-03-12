import { UserSocket } from '@app/model/socket/socket.schema';

export interface GameStats {
    id: string;
    duration: number;
    questions: QuestionStats[];
    users: UserSocket[];
}

export interface QuestionStats {
    title: string;
    statLines: StatsLine[];
    type: string;
    points: number;
}

export interface StatsLine {
    label: string;
    users: string[];
    isCorrect?: boolean;
}
export const FAKE_STAT_LINE: StatsLine = { label: '', users: [] };
export const FAKE_QUESTION_STAT: QuestionStats = { title: 'string', statLines: [FAKE_STAT_LINE], type: '', points: 10 };
export const FAKE_GAME_STAT: GameStats = { id: '123', duration: 30, questions: [], users: [] };
