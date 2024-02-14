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

export enum QuizEnum {
    MINCHOICESLENGTH = 1,
    MAXCHOICESLENGTH = 4,
    MINPOINTS = 10,
    MAXPOINTS = 100,
    IDHEX = '0123456789',
    IDLENGTH = 6,
}
