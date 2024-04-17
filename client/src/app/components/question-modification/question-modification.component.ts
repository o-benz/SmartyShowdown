import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { ErrorMessages, SuccessMessages } from '@app/interfaces/alert-messages';
import { BaseQuestion } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-modification',
    templateUrl: './question-modification.component.html',
    styleUrls: ['./question-modification.component.scss'],
})
export class QuestionModificationComponent implements OnDestroy {
    @Input() question: BaseQuestion;
    @Input() quizModified: Quiz;
    dialogRef: MatDialogRef<unknown>;

    protected previousSelectedQuestion: BaseQuestion;
    private questionModificationSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
        private dialogAlertService: DialogAlertService,
    ) {}

    modifyQuestion(): void {
        const dialogRef = this.dialog.open(NewQuestionFormComponent, {
            data: { baseQuestion: this.question },
            width: '50%',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result: BaseQuestion) => {
            if (result) {
                this.quizModified.questions[this.quizModified.questions.indexOf(this.question)] = result;
            }
        });
    }

    deleteQuizQuestion(): void {
        this.questionService.deleteQuizQuestion(this.question, this.quizModified);
    }

    placeQuestionHigher(): void {
        this.questionService.placeHigher(this.question, this.quizModified);
    }

    placeQuestionLower(): void {
        this.questionService.placeLower(this.question, this.quizModified);
    }

    addToBank(question: BaseQuestion): void {
        this.questionModificationSubscription = this.questionService.addQuestionToBank(question).subscribe({
            next: () => {
                this.dialogAlertService.openSuccessDialog(SuccessMessages.QuestionBankAdded);
            },
            error: (error) => {
                if (error.error.includes('Question already exists')) {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.QuestionAlreadyInBank);
                } else {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.AddQuestionToBank);
                }
            },
        });
    }

    ngOnDestroy(): void {
        if (this.questionModificationSubscription) this.questionModificationSubscription.unsubscribe();
    }
}
