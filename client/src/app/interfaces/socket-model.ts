export interface SocketAnswer {
    joined: boolean;
    message?: string;
}

export interface User {
    id?: string;
    username: string;
    room?: string;
    score?: number;
    bonus?: number;
    answered: boolean;
    firstToAnswer?: boolean;
    hasLeft?: boolean;
    isMuted?: boolean;
}

export enum Naviguation {
    Back = 'popstate',
}
