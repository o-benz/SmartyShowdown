/* eslint-disable */
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
    QCM = 'QCM',
    QRL = 'QRL',
    RANDOMMODE = 'Mode Aléatoire',
    RANDOMDESCRIPTION = 'Questions aléatoires',
    IDHEX = '0123456789',
}

export enum QuizComponentEnum {
    MAXDURATION = 100,
    MINDURATION = 10,
    MAXCHOICES = 4,
    NOTFOUND = -1
}