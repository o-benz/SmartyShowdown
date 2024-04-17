import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAlertComponent } from '@app/components/dialog-alert/dialog-alert.component';
import { CustomDialogOptions, DialogAlertData } from '@app/interfaces/dialog-alert';
@Injectable({
    providedIn: 'root',
})
export class DialogAlertService {
    private data: DialogAlertData = {
        alertMessage: '',
        answerArray: [],
        pointsGained: 0,
        messageType: 'error',
    };

    constructor(private dialog: MatDialog) {}

    getAlertMessage(): string {
        return this.data.alertMessage;
    }

    getAlertArray(): string[] {
        return this.data.answerArray;
    }

    getPointsGained(): number {
        return this.data.pointsGained;
    }

    getMessageType(): 'error' | 'success' {
        return this.data.messageType;
    }

    setAlertMessage(message: string): void {
        if (typeof message === 'string') this.data.alertMessage = message;
    }

    setAnswerArray(message: string[]): void {
        if (message.every((item) => typeof item === 'string')) this.data.answerArray = message;
    }

    setPointsGained(points: number): void {
        if (typeof points === 'number' && points >= 0) this.data.pointsGained = points;
    }

    openErrorDialog(message: string): void {
        this.data.alertMessage = message;
        this.data.messageType = 'error';
        this.dialog.open(DialogAlertComponent);
    }

    openSuccessDialog(message: string): void {
        this.data.alertMessage = message;
        this.data.messageType = 'success';
        this.dialog.open(DialogAlertComponent);
    }

    closeAlertDialog(): void {
        this.dialog.closeAll();
    }

    openCustomDialog<T>(options: CustomDialogOptions<T>): void {
        this.data.answerArray = options.message;
        this.data.pointsGained = options.points;
        this.data.alertMessage = `+${options.points} points. Votre score est ${options.score}!`;
        this.dialog.open(options.dialogComponent);
        if (options.points > options.questionPoints) {
            this.data.alertMessage = `+${options.points} points. Votre score est ${options.score}! Vous avez eu le bonus!`;
        }
    }

    openSimpleDialog<T>(dialogComponent: ComponentType<T>): void {
        this.dialog.open(dialogComponent, { disableClose: true });
        this.data.alertMessage = '';
    }
}
