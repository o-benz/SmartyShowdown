import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { Quiz, defaultQuiz } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-create-quiz',
    templateUrl: './create-quiz.component.html',
    styleUrls: ['./create-quiz.component.scss'],
})
export class CreateQuizComponent implements OnInit {
    protected quizModified: Quiz;
    protected modify: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private quizService: QuizService,
        private router: Router,
        private dialogService: DialogErrorService,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const routeID = params['id'];
            if (routeID) {
                this.fetchQuiz(routeID);
            } else {
                this.initializeNewQuiz();
            }
        });
    }

    fetchQuiz(id: string): void {
        this.quizService.getQuizById(id).subscribe((quiz: Quiz) => {
            this.quizModified = quiz;
        });
    }

    initializeNewQuiz(): void {
        this.quizModified = defaultQuiz;
    }

    onSubmit(): void {
        this.quizModified.visible = false;
        this.quizService.addQuiz(this.quizModified).subscribe((result) => {
            if (!result) {
                this.dialogService.openErrorDialog(ErrorMessages.QuizInvalid);
            } else {
                this.router.navigate(['/creategame']);
            }
        });
    }
}
