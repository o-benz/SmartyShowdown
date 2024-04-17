import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { Quiz } from '@app/interfaces/quiz-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit, OnDestroy {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;
    dialogRef: MatDialogRef<unknown>;
    selectedQuiz: Quiz;
    quizList: Quiz[];
    isRandom: boolean = false;
    private quizSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private quizService: QuizService,
        private router: Router,
        private dialogService: DialogAlertService,
        private socketCommunicationService: SocketCommunicationService,
    ) {}

    ngOnInit(): void {
        this.quizSubscription = this.quizService.getAllQuiz().subscribe(async (quizzes: Quiz[]) => {
            this.quizList = this.quizService.addQuizToList(await this.quizService.generateRandomQuiz(), quizzes);
        });
    }

    openDialog(quiz: Quiz): void {
        this.selectedQuiz = quiz;
        this.isRandom = this.selectedQuiz.title === 'Mode Aléatoire';
        setTimeout(() => {
            this.dialogRef = this.dialog.open(this.dialogTemplate, {
                width: '50%',
            });
        });
    }

    validateBeforeClosing(): void {
        this.quizSubscription = this.quizService.getQuizById(this.selectedQuiz.id).subscribe((quiz: Quiz) => {
            if (quiz && this.dialogRef && quiz.visible) {
                this.router.navigate(['/game/test', quiz.id]);
            } else {
                this.dialogService.openErrorDialog(ErrorMessages.QuizNotAvailable);
            }
            this.dialogRef.close();
        });
    }

    createGameRoom(): void {
        this.socketCommunicationService.connect();
        const createRoomMethod = this.isRandom
            ? this.socketCommunicationService.createRandomRoom(this.selectedQuiz)
            : this.socketCommunicationService.createRoom(this.selectedQuiz.id);

        createRoomMethod.subscribe({
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
