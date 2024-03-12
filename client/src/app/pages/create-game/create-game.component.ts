import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorMessages } from '@app/interfaces/error-messages';
import { Quiz } from '@app/interfaces/quiz-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit, OnDestroy {
    dialogRef: MatDialogRef<unknown>;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    selectedQuiz: Quiz;
    quizList: Quiz[];
    private quizSubscription: Subscription;

    /* eslint-disable */
    constructor(
        public dialog: MatDialog,
        private quizService: QuizService, // removing the warning for constructor params limit
        private router: Router,
        private dialogService: DialogErrorService,
        private socketCommunicationService: SocketCommunicationService,

    ) {}
    /* eslint-enabled */

    ngOnInit(): void {
        this.quizSubscription = this.quizService.getAllQuiz().subscribe((quizzes: Quiz[]) => {
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
        this.quizSubscription = this.quizService.getQuizById(this.selectedQuiz.id).subscribe((quiz: Quiz) => {
            if (quiz && this.dialogRef && quiz.visible !== false) {
                this.router.navigate(['/game/test', quiz.id]);
            } else {
                this.dialogService.openErrorDialog(ErrorMessages.QuizNotAvailable);
            }
            this.dialogRef.close();
        });
    }

    createGameRoom(): void {
        this.socketCommunicationService.connect();
        this.socketCommunicationService.createRoom(this.selectedQuiz.id).subscribe({
            next: (roomCode) => {
                localStorage.setItem('roomCode', roomCode);
                this.router.navigate(['/game/lobby']);
                this.closeDialog(); 
            },
        });
    }
    
    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        if (this.quizSubscription) this.quizSubscription.unsubscribe();
    }
}
