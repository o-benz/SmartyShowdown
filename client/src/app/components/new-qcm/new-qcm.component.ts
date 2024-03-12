import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-new-qcm',
    templateUrl: './new-qcm.component.html',
    styleUrls: ['./new-qcm.component.scss'],
})
export class NewQcmComponent implements OnInit, OnDestroy {
    @Input() quizModified: Quiz;

    protected newQuestion: Question;
    protected listQCM: Question[];
    private newQcmSubscription: Subscription;

    constructor(
        private questionService: QuestionService,
        private dialogService: DialogErrorService,
    ) {}

    ngOnInit(): void {
        this.newQcmSubscription = this.questionService.getAllQuestions().subscribe((questions) => {
            this.listQCM = questions;
        });
        this.newQuestion = {
            type: QuizEnum.QCM,
            text: '',
            points: 10,
            choices: [],
        };
    }

    addMultipleChoice(text: string, isCorrect: boolean) {
        this.questionService.addMultipleChoice({ text, isCorrect }, this.newQuestion);
    }

    saveQCM(): void {
        this.newQcmSubscription = this.questionService.checkValidity(this.newQuestion).subscribe((isValid) => {
            if (isValid) {
                this.quizModified.questions.push(JSON.parse(JSON.stringify(this.newQuestion)));
            } else {
                this.dialogService.openErrorDialog(ErrorMessages.QuestionInvalid);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.newQcmSubscription) this.newQcmSubscription.unsubscribe();
    }
}
