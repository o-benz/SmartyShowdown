import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-create-quiz',
    templateUrl: './create-quiz.component.html',
    styleUrls: ['./create-quiz.component.scss'],
})
export class CreateQuizComponent implements OnInit {
    protected quizModified: Quiz;
    protected modify: boolean;

    constructor(
        private route: ActivatedRoute,
        private quizService: QuizService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const routeID = params['id'];
            if (routeID) {
                this.modify = true;
                this.quizService.getQuizById(routeID).subscribe((quiz: Quiz) => {
                    this.quizModified = quiz;
                });
            } else {
                this.quizModified = {
                    id: '',
                    visible: true,
                    title: '',
                    description: '',
                    duration: 10,
                    lastModification: '',
                    questions: [],
                };
            }
        });
    }

    onSubmit(): void {
        this.quizModified.visible = false;
        this.quizService.addQuiz(this.quizModified).subscribe((result) => {
            if (!result) {
                alert('Quiz not valid');
            } else {
                this.router.navigate(['/creategame']);
            }
        });
    }
}
