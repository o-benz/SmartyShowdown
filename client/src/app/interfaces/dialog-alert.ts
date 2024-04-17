import { ComponentType } from '@angular/cdk/portal';

export interface DialogAlertData {
    alertMessage: string;
    pointsGained: number;
    answerArray: string[];
    messageType: 'error' | 'success';
}

export interface CustomDialogOptions<T> {
    message: string[];
    dialogComponent: ComponentType<T>;
    points: number;
    score: number;
    questionPoints: number;
}
