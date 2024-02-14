import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz-model';
// eslint-disable-next-line no-restricted-imports
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit {
    dialogRef: MatDialogRef<unknown>;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    selectedQuiz: Quiz;
    quizList: Quiz[];

    constructor(
        public dialog: MatDialog,
        private quizService: QuizService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.quizService.getAllQuiz().subscribe((quizzes: Quiz[]) => {
            this.quizList = this.quizService.generateRandomQuiz(quizzes);
        });
    }

    openDialog(quiz: Quiz): void {
        this.selectedQuiz = quiz;
        setTimeout(() => {
            this.dialogRef = this.dialog.open(this.dialogTemplate, {
                width: '50%',
            });
        });
    }

    validateBeforeClosing(): void {
        this.quizService.getQuizById(this.selectedQuiz.id).subscribe((quiz: Quiz) => {
            if (quiz && this.dialogRef && quiz.visible !== false) {
                this.router.navigate(['/game/test', quiz.id]);
            } else {
                alert('This quiz is not available, choose another one.');
            }
            this.dialogRef.close();
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
