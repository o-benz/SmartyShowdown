import { Component, Input, OnInit } from '@angular/core';
import { Question, Quiz, QuizEnum } from '@app/interfaces/quiz-model';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-new-qcm',
    templateUrl: './new-qcm.component.html',
    styleUrls: ['./new-qcm.component.scss'],
})
export class NewQcmComponent implements OnInit {
    @Input() quizModified: Quiz;

    protected newQuestion: Question;
    protected listQCM: Question[];

    constructor(private questionService: QuestionService) {}

    ngOnInit(): void {
        this.questionService.getAllQuestions().subscribe((questions) => {
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
        this.questionService.checkValidity(this.newQuestion).subscribe((isValid) => {
            if (isValid) {
                this.quizModified.questions.push(JSON.parse(JSON.stringify(this.newQuestion)));
            } else {
                alert('Invalid question');
            }
        });
    }
}
