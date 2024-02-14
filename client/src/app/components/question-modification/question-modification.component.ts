import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-question-modification',
    templateUrl: './question-modification.component.html',
    styleUrls: ['./question-modification.component.scss'],
})
export class QuestionModificationComponent {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    @Input() question: Question;
    @Input() quizModified: Quiz;
    dialogRef: MatDialogRef<unknown>;

    protected previousSelectedQuestion: Question;

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
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
            this.questionService.checkValidity(this.question).subscribe((isValid) => {
                if (isValid) {
                    this.dialogRef.close();
                } else {
                    this.question = JSON.parse(JSON.stringify(this.previousSelectedQuestion));
                    alert('Question is not valid');
                }
            });
        } else {
            this.dialogRef.close();
        }
    }

    addToBank(qcm: Question): void {
        this.questionService.addQuestionToBank(qcm).subscribe({});
    }
}
