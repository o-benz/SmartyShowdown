export interface Choice {
    text: string;
    isCorrect?: boolean | null;
}

export interface Question {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
}

export interface Quiz {
    id: string;
    visible: boolean;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[];
}

export interface CorrectionData {
    clientAnswers: Choice[];
    questionText: string;
    quizId: string;
}
export enum QuizEnum {
    MINCHOICESLENGTH = 1,
    MAXCHOICESLENGTH = 4,
    MINPOINTS = 10,
    MAXPOINTS = 100,
    IDHEX = '0123456789',
    IDLENGTH = 6,
}

export const BONUS_MULTIPLIER = 0.2;
export const POSITIVE_POINTS = 1;
export const NEGATIVE_POINTS = -1;
