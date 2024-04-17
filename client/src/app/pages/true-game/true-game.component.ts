import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStats } from '@app/interfaces/game-stats';
import { BaseQuestion } from '@app/interfaces/question-model';
import { Quiz } from '@app/interfaces/quiz-model';
import { User } from '@app/interfaces/socket-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-true-game',
    templateUrl: './true-game.component.html',
    styleUrls: ['./true-game.component.scss'],
})
export class TrueGameComponent implements OnInit, OnDestroy {
    @ViewChild('chat') chatElement: ElementRef | undefined;
    @ViewChild('game') gameElement: ElementRef | undefined;

    questionIndex: number = 0;
    currentQuestion: BaseQuestion;
    mode: string;
    time: number = 0;
    isRoundFinished: boolean = false;
    isTimeOver: boolean = false;
    isAnswerCorrect: boolean = false;
    protected isRandom: boolean = false;
    protected isOrganizer: boolean = false;
    protected isFirstAnswer: boolean = false;
    protected questions: BaseQuestion[] = [];
    private game: Quiz;
    private gameStats: GameStats;
    private gameSubscription: Subscription | undefined;
    private socketSubscription: Subscription;
    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
        private socketService: SocketCommunicationService,
        private dialogAlertService: DialogAlertService,
    ) {}

    ngOnInit(): void {
        this.game = {
            id: '',
            title: '',
            description: '',
            duration: 0,
            lastModification: '',
            questions: [],
        };
        this.requestUser();
        this.gameService.score = 0;
        this.gameService.currentChoices = [];
        let id;
        const url = this.route.snapshot.url.toString();
        this.socketService.getRandom().subscribe((isRandom: boolean) => {
            this.isRandom = isRandom;
        });
        if (url.includes('test')) {
            id = this.setUpRoom();
            this.requestQuiz(id);
        } else {
            this.requestGameStats();
        }

        this.handleQuestionChange();
        this.handleShowingResults();
    }

    nextQuestion(isPopupOver: boolean) {
        this.isRoundFinished = isPopupOver;
        this.isAnswerCorrect = isPopupOver;
        this.isTimeOver = isPopupOver;
        this.questionIndex++;

        if (this.questionIndex < this.questions.length) {
            this.currentQuestion = this.questions[this.questionIndex];
        } else if (this.mode === 'test') {
            this.socketService.disconnect();
            this.router.navigate(['/creategame']);
        } else if (this.questionIndex === this.questions.length) {
            this.router.navigate(['/game/result']);
        }
    }

    calculateScore(isAnswerCorrect: boolean) {
        if (this.mode === 'test') {
            this.isRoundFinished = true;
        }
        if (isAnswerCorrect) {
            if (this.mode === 'test') {
                this.gameService.giveUserPoints(this.currentQuestion);
            }
            this.isAnswerCorrect = true;
        }
        this.isTimeOver = true;
    }

    ngOnDestroy(): void {
        this.gameSubscription?.unsubscribe();
    }

    requestGameStats(): void {
        this.socketSubscription = this.socketService.getStats().subscribe({
            next: (gameStats) => {
                this.gameStats = gameStats;
                if (this.gameStats.id) {
                    this.gameService.quizId = this.gameStats.id;
                }
                if (this.gameStats.questions) {
                    this.questions = this.gameService.gamestatsToQuestions(gameStats);
                }
                this.time = this.gameStats.duration;
                this.currentQuestion = this.questions[this.questionIndex];
            },
            complete: () => {
                if (this.socketSubscription) this.socketSubscription.unsubscribe();
            },
        });
    }

    setUpRoom(): string | null {
        this.socketService.connect();
        this.mode = 'test';
        const id = this.route.snapshot.paramMap.get('id');
        let roomCode = '';
        this.socketService.createRoom(id || '').subscribe((roomId) => {
            roomCode = roomId;
        });

        this.socketService.joinRoom(id || '');
        this.socketService.login('testUser');
        this.socketService.lockRoom(roomCode);
        this.socketService.attemptStartGame(roomCode);
        return id;
    }

    requestQuiz(id: string | null): void {
        this.quizService.getQuizById(id || '').subscribe((quiz: Quiz) => {
            this.game = quiz;
            if (this.game.id) {
                this.gameService.quizId = this.game.id;
            }
            if (this.game.questions) {
                this.questions = this.game.questions;
            }
            this.time = this.game.duration;
            this.currentQuestion = this.questions[this.questionIndex];
        });
    }

    requestUser(): void {
        this.socketService.getUser().subscribe((user: User) => {
            this.isOrganizer = user.username === 'organisateur';
        });
    }

    handleQuestionChange() {
        this.socketService.onChangeQuestion(() => {
            this.isRoundFinished = true;
        });
    }

    handleShowingResults() {
        this.socketService.onShowResults(() => {
            this.dialogAlertService.closeAlertDialog();
            if (this.isRandom) this.isRoundFinished = true;
            else this.router.navigate(['/game/result']);
        });
    }
}
