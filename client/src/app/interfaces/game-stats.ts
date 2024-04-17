import { BaseQuestion } from './question-model';

export interface GameStats {
    id: string;
    duration: number;
    questions: QuestionStats[];
    users: PlayerInfo[];
    name: string;
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
    hasLeft?: boolean;
    textAnswer?: string;
    state?: PlayerState;
    isMuted?: boolean;
}

export interface ServerStats {
    id: string;
    duration: number;
    questions: QuestionStatsServer[];
    users: UserSocket[];
    name: string;
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
    data: {
        id?: string;
        username: string;
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

export interface TimePackage {
    time: number;
    question: BaseQuestion;
    currentQuestionIndex: number;
}

export interface QuestionTimePackage {
    time: number;
    question: BaseQuestion;
    isTimeOver: boolean;
    mode: string;
    isOrganizer?: boolean;
    currentQuestionIndex: number;
}

export enum PlayerState {
    AnswerConfirmed = 3,
    FirstInteraction = 2,
    NoInteraction = 1,
    PlayerLeft = 0,
}
