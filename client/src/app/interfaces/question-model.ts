export interface Choice {
    text: string;
    isCorrect?: boolean | null;
}

export interface BaseQuestion {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
}

export interface Question extends BaseQuestion {
    date: Date;
    _id: string;
}

export enum TypeEnum {
    QCM = 'QCM',
    QRL = 'QRL',
    ALL = 'ALL',
}
