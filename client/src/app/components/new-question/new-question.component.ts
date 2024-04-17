import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { BaseQuestion, TypeEnum } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent implements OnInit, OnDestroy {
    @Input() quizModified: Quiz;

    protected newQuestion: BaseQuestion;
    protected listQuestion: BaseQuestion[];
    protected filterState = TypeEnum.ALL;
    protected typeEnum = TypeEnum;
    private newQuestionSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        private dialogService: DialogAlertService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.newQuestionSubscription = this.questionService.getAllQuestions().subscribe((questions) => {
            this.listQuestion = questions;
        });
    }

    createQuestion(): void {
        const dialogRef = this.dialog.open(NewQuestionFormComponent, {
            data: { baseQuestion: null },
            width: '50%',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result: BaseQuestion) => {
            if (result) {
                this.addQuestionToQuiz(result);
            }
        });
    }

    addQuestionToQuiz(question: BaseQuestion): void {
        this.newQuestionSubscription = this.questionService.checkValidity(question).subscribe((isValid) => {
            if (isValid) {
                this.quizModified.questions.push(JSON.parse(JSON.stringify(question)));
            } else {
                this.dialogService.openErrorDialog(ErrorMessages.QuestionInvalid);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.newQuestionSubscription) this.newQuestionSubscription.unsubscribe();
    }

    protected setFilterState(state: TypeEnum) {
        this.filterState = state;
        this.updateQuestionsList();
        this.newQuestion = {} as BaseQuestion;
    }

    private updateQuestionsList(): void {
        this.questionService.getQuestionsByType(this.filterState).subscribe((questions: BaseQuestion[]) => {
            this.listQuestion = questions;
        });
    }
}
