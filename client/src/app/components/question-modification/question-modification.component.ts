import { Component, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-modification',
    templateUrl: './question-modification.component.html',
    styleUrls: ['./question-modification.component.scss'],
})
export class QuestionModificationComponent implements OnDestroy {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    @Input() question: Question;
    @Input() quizModified: Quiz;
    dialogRef: MatDialogRef<unknown>;

    protected previousSelectedQuestion: Question;
    private questionModificationSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
        private dialogService: DialogErrorService,
    ) {}

    closeDialog(): void {
        if (this.dialogRef) {
            this.question = JSON.parse(JSON.stringify(this.previousSelectedQuestion));
            this.dialogRef.close();
        }
    }

    openDialog(): void {
        this.previousSelectedQuestion = JSON.parse(JSON.stringify(this.question));
        setTimeout(() => {
            this.dialogRef = this.dialog.open(this.dialogTemplate, {
                width: '50%',
                disableClose: true,
            });
        });
    }

    addMultipleChoice(text: string, isCorrect: boolean) {
        this.questionService.addMultipleChoice({ text, isCorrect }, this.question);
    }

    deleteQuestion(): void {
        this.questionService.deleteQuestion(this.question, this.quizModified);
    }

    placeQuestionHigher(): void {
        this.questionService.placeHigher(this.question, this.quizModified);
    }

    placeQuestionLower(): void {
        this.questionService.placeLower(this.question, this.quizModified);
    }

    saveChanges(): void {
        if (this.question.type === QuizEnum.QCM) {
            this.questionModificationSubscription = this.questionService.checkValidity(this.question).subscribe((isValid) => {
                if (isValid) {
                    this.dialogRef.close();
                } else {
                    this.question = JSON.parse(JSON.stringify(this.previousSelectedQuestion));
                    this.dialogService.openErrorDialog(ErrorMessages.QuestionInvalid);
                }
            });
        } else {
            this.dialogRef.close();
        }
    }

    addToBank(qcm: Question): void {
        this.questionModificationSubscription = this.questionService.addQuestionToBank(qcm).subscribe({});
    }

    ngOnDestroy(): void {
        if (this.questionModificationSubscription) this.questionModificationSubscription.unsubscribe();
    }
}
