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
    visible?: boolean;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[];
}

export class MultipleChoiceQuestion {
    date: Date;
    type: string;
    question: string;
    points: number;
    choices: Choice[];
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
    NOTFOUND = -1,
}

export const defaultQuiz: Quiz = {
    id: '',
    visible: true,
    title: '',
    description: '',
    duration: 10,
    lastModification: '',
    questions: [],
};

export interface Answer {
    answer: number;
    questionIndex: number;
}

export interface Answers {
    answers: Choice[];
    questionIndex: number;
}

export interface DataPoint {
    label: string;
    y: number;
    isCorrect: boolean | undefined;
    x: number;
}
