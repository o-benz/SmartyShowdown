import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { BaseMultipleChoiceQuestion, MultipleChoiceQuestion, QuestionModel } from '@app/interfaces/question-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { AdminQuestionHandlerService } from '@app/services/mcq-handler/mcq-handler.service';
import { Types } from 'mongoose';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit, OnDestroy {
    static questions: QuestionModel[];
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    private questionsSubscription: Subscription;

    constructor(
        private adminQuestionHandler: AdminQuestionHandlerService,
        private dialog: MatDialog,
        private dialogErrorService: DialogErrorService,
    ) {}

    get questions() {
        return QuestionListComponent.questions;
    }
    ngOnInit(): void {
        this.questionsSubscription = this.adminQuestionHandler.getAllMultipleChoiceQuestions().subscribe((questions: MultipleChoiceQuestion[]) => {
            QuestionListComponent.questions = questions as QuestionModel[];
        });
    }

    ngOnDestroy(): void {
        this.questionsSubscription.unsubscribe();
    }

    deleteQuestion(id: Types.ObjectId): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
            this.adminQuestionHandler.deleteMultipleChoiceQuestion(id).subscribe({
                next: () => {
                    // eslint-disable-next-line no-underscore-dangle
                    QuestionListComponent.questions = QuestionListComponent.questions.filter((question) => question._id !== id);
                },
                error: () => {
                    this.dialogErrorService.openErrorDialog(ErrorMessages.DeleteQuestionError);
                },
            });
        }
    }

    modifyQuestion(id: Types.ObjectId): void {
        const dialogRef = this.dialog.open(NewQuestionFormComponent, {
            // eslint-disable-next-line no-underscore-dangle
            data: { baseQuestion: QuestionListComponent.questions.find((question) => question._id === id) },
            width: '50%',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result: QuestionModel) => {
            if (this.isMultipleChoiceQuestion(result)) {
                this.updateQuestion(result, id);
            }
        });
    }

    createQuestion(): void {
        const dialogRef = this.dialog.open(NewQuestionFormComponent, {
            data: { baseQuestion: null },
            width: '50%',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result: QuestionModel) => {
            if (this.isMultipleChoiceQuestion(result)) {
                this.addQuestion(result);
            }
        });
    }

    protected isMultipleChoiceQuestion(question: QuestionModel): question is MultipleChoiceQuestion {
        return question.type === 'QCM';
    }

    private updateQuestion(result: QuestionModel, id: Types.ObjectId): void {
        this.adminQuestionHandler.updateMultipleChoiceQuestion({ ...(result as MultipleChoiceQuestion), _id: id }).subscribe({
            next: () => {
                this.updateQuestionsList();
            },
            error: () => {
                this.dialogErrorService.openErrorDialog(ErrorMessages.UpdateQuestionError);
            },
        });
    }

    private addQuestion(result: QuestionModel): void {
        const multipleChoiceQuestion = result as BaseMultipleChoiceQuestion;
        this.adminQuestionHandler.addMultipleChoiceQuestion(multipleChoiceQuestion).subscribe({
            next: () => {
                this.updateQuestionsList();
            },
            error: () => {
                this.dialogErrorService.openErrorDialog(ErrorMessages.AddQuestionError);
            },
        });
    }

    private updateQuestionsList(): void {
        this.adminQuestionHandler.getAllMultipleChoiceQuestions().subscribe((questions: MultipleChoiceQuestion[]) => {
            QuestionListComponent.questions = questions as QuestionModel[];
        });
    }
}
