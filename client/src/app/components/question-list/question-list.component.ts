import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewQuestionFormComponent } from '@app/components/new-question-form/new-question-form.component';
import { ErrorMessages, SuccessMessages } from '@app/interfaces/alert-messages';
import { BaseQuestion, Question, TypeEnum } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionService } from '@app/services/question/question.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit, OnDestroy {
    static questions: Question[];
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    protected filterState = TypeEnum.ALL;
    protected typeEnum = TypeEnum;
    private questionsSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        private dialog: MatDialog,
        private dialogAlertService: DialogAlertService,
    ) {}

    get questions() {
        return QuestionListComponent.questions;
    }
    ngOnInit(): void {
        this.questionsSubscription = this.questionService.getAllQuestionsInformation().subscribe((questions: Question[]) => {
            QuestionListComponent.questions = questions as Question[];
        });
    }

    ngOnDestroy(): void {
        this.questionsSubscription.unsubscribe();
    }

    deleteQuestion(question: Question): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
            this.questionService.deleteQuestionFromBank(question).subscribe({
                next: () => {
                    // eslint-disable-next-line no-underscore-dangle
                    QuestionListComponent.questions = QuestionListComponent.questions.filter((questions) => questions._id !== question._id);
                    this.dialogAlertService.openSuccessDialog(SuccessMessages.QuestionDeleted);
                },
                error: () => {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.DeleteQuestionError);
                },
            });
        }
    }

    modifyQuestion(id: string): void {
        const dialogRef = this.dialog.open(NewQuestionFormComponent, {
            // eslint-disable-next-line no-underscore-dangle
            data: { baseQuestion: QuestionListComponent.questions.find((question) => question._id === id) },
            width: '50%',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result: Question) => {
            if (this.isValidQuestion(result)) {
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

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (this.isValidQuestion(result)) {
                this.addQuestion(result);
            }
        });
    }

    protected setFilterState(state: TypeEnum) {
        this.filterState = state;
        this.updateQuestionsList();
    }

    protected isMultipleChoiceQuestion(question: Question): question is Question {
        return question.type === 'QCM';
    }

    protected isOpenEndedQuestion(question: Question): question is Question {
        return question.type === 'QRL';
    }

    private isValidQuestion(result: Question): boolean {
        return result && (this.isMultipleChoiceQuestion(result) || this.isOpenEndedQuestion(result));
    }

    private updateQuestion(result: Question, id: string): void {
        this.questionService.updateQuestionInBank({ ...(result as Question), _id: id }).subscribe({
            next: () => {
                this.updateQuestionsList();
                this.dialogAlertService.openSuccessDialog(SuccessMessages.QuestionUpdated);
            },
            error: (error) => {
                if (error.error?.includes('Question already exists')) {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.QuestionAlreadyInBank);
                } else {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.UpdateQuestionError);
                }
            },
        });
    }

    private addQuestion(result: Question): void {
        const multipleChoiceQuestion = result as BaseQuestion;
        this.questionService.addQuestionToBank(multipleChoiceQuestion).subscribe({
            next: () => {
                this.updateQuestionsList();
                this.dialogAlertService.openSuccessDialog(SuccessMessages.QuestionAdded);
            },
            error: (error) => {
                if (error.error?.includes('Question already exists')) {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.QuestionAlreadyInBank);
                } else {
                    this.dialogAlertService.openErrorDialog(ErrorMessages.AddQuestionToBank);
                }
            },
        });
    }

    private updateQuestionsList(): void {
        const questionsObservable: Observable<Question[]> = this.questionService.getQuestionsByType(this.filterState);

        questionsObservable.subscribe((questions: Question[]) => {
            QuestionListComponent.questions = questions;
        });
    }
}
