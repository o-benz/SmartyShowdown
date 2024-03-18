import { UserSocket } from '@app/model/socket/socket.schema';

export interface GameStats {
    id: string;
    duration: number;
    questions: QuestionStats[];
    users: UserSocket[];
    name: string;
}

export interface QuestionStats {
    title: string;
    statLines: StatsLine[];
    type: string;
    points: number;
    timeFinished?: boolean;
}

export interface StatsLine {
    label: string;
    users: string[];
    isCorrect?: boolean;
}
