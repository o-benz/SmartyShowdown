import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogErrorComponent } from '@app/components/dialog-error/dialog-error.component';

@Injectable({
    providedIn: 'root',
})
export class DialogErrorService {
    private errorMessage: string;
    private pointsGained: number;
    private answerArray: string[];

    constructor(private dialog: MatDialog) {}

    getErrorMessage(): string {
        return this.errorMessage;
    }

    getAnswerArray(): string[] {
        return this.answerArray;
    }

    getPointsGained(): number {
        return this.pointsGained;
    }

    setErrorMessage(message: string): void {
        this.errorMessage = message;
    }

    setAnswerArray(message: string[]): void {
        this.answerArray = message;
    }

    setPointsGained(points: number): void {
        this.pointsGained = points;
    }

    openErrorDialog(message: string): void {
        this.errorMessage = message;
        this.dialog.open(DialogErrorComponent);
    }

    closeErrorDialog(): void {
        this.dialog.closeAll();
    }

    openCustomDialog<T>(message: string[], dialogComponent: ComponentType<T>, points: number, score: number): void {
        this.answerArray = message;
        this.pointsGained = points;
        this.errorMessage = `+${points} points. Votre score est ${score}!`;
        this.dialog.open(dialogComponent);
    }
}
