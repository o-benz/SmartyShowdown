import { Question } from './quiz-model';

export interface GameStats {
    id: string;
    duration: number;
    questions: QuestionStats[];
    users: PlayerInfo[];
}

export interface QuestionStats {
    title: string;
    type: string;
    points: number;
    statLines: StatsLine[];
}

export interface StatsLine {
    label: string;
    nbrOfSelection: number;
    isCorrect?: boolean;
}

export interface PlayerInfo {
    name: string;
    score?: number;
    bonusCount?: number;
}

export interface ServerStats {
    id: string;
    duration: number;
    questions: QuestionStatsServer[];
    users: UserSocket[];
}

export interface QuestionStatsServer {
    title: string;
    type: string;
    points: number;
    statLines: StatsLineServer[];
}

export interface StatsLineServer {
    label: string;
    users: string[];
    isCorrect?: boolean;
}

export interface UserSocket {
    id?: string;
    username: string;
    room?: string;
    score?: number;
    bonus?: number;
}

export interface TimePackage {
    time: number;
    question: Question;
    currentQuestionIndex: number;
}
