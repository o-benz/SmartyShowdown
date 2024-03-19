import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStats } from '@app/interfaces/game-stats';
import { Question, Quiz } from '@app/interfaces/quiz-model';
import { User } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
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
    game: Quiz;
    gameStats: GameStats;
    questions: Question[] = [];
    questionIndex: number = 0;
    currentQuestion: Question;
    duration: number;
    mode: string;
    time: number = 0;
    isRoundFinished: boolean = false;
    isTimeOver: boolean = false;
    isAnswerCorrect: boolean = false;
    readonly bonus: number = 1.2;
    isChatFocused = false;
    isGameFocused = false;
    protected isOrganizer: boolean = false;
    private gameSubscription: Subscription | undefined;
    private socketSubscription: Subscription;
    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
        private socketService: SocketCommunicationService,
        private dialogErrorService: DialogErrorService,
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
        this.socketService.getUser().subscribe((user: User) => {
            this.isOrganizer = user.username === 'organisateur';
        });
        this.gameService.score = 0;
        this.gameService.currentChoices = [];
        let id;
        const url = this.route.snapshot.url.toString();
        if (url.includes('test')) {
            this.socketService.connect();
            this.mode = 'test';
            id = this.route.snapshot.paramMap.get('id');

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
        } else {
            this.socketSubscription = this.socketService.getStats().subscribe({
                next: (gameStats) => {
                    this.gameStats = gameStats;
                    if (this.gameStats.id) {
                        this.gameService.quizId = this.gameStats.id;
                    }
                    if (this.gameStats.questions) {
                        this.questions = gameStats.questions.map((question) => {
                            return {
                                text: question.title,
                                type: question.type,
                                points: question.points,
                                choices: question.statLines.map((line) => {
                                    return { text: line.label, isCorrect: line.isCorrect };
                                }),
                            };
                        });
                    }
                    this.time = this.gameStats.duration;
                    this.currentQuestion = this.questions[this.questionIndex];
                },
                complete: () => {
                    if (this.socketSubscription) this.socketSubscription.unsubscribe();
                },
            });
        }

        this.socketService.onChangeQuestion(() => {
            this.isRoundFinished = true;
        });

        this.socketService.onFinalizeAnswers(() => {
            if (!this.gameService.isChoiceFinal) {
                this.gameSubscription = this.gameService.postCurrentChoices(this.currentQuestion.text).subscribe((isAnswerCorrect: boolean) => {
                    this.calculateScore(isAnswerCorrect);
                });
            }
        });
        this.socketService.onShowResults(() => {
            this.dialogErrorService.closeErrorDialog();
            this.router.navigate(['/game/result']);
        });
    }

    setFocusOnChat() {
        this.chatElement?.nativeElement?.focus();
        this.isChatFocused = true;
        this.isGameFocused = false;
    }

    setFocusOnGame() {
        this.gameElement?.nativeElement?.focus();
        this.isChatFocused = false;
        this.isGameFocused = true;
    }

    nextQuestion(isPopupOver: boolean) {
        this.isRoundFinished = isPopupOver;
        this.isAnswerCorrect = isPopupOver;
        this.isTimeOver = isPopupOver;
        this.questionIndex++;
        if (this.questionIndex < this.questions.length) {
            this.currentQuestion = this.questions[this.questionIndex];
        } else {
            if (this.mode === 'test') {
                this.router.navigate(['/creategame']);
            }
        }
    }

    calculateScore(isAnswerCorrect: boolean) {
        if (this.mode === 'test') {
            this.isRoundFinished = true;
        }
        if (isAnswerCorrect) {
            if (this.mode === 'test') {
                this.gameService.score += this.currentQuestion.points * this.bonus;
            } else this.gameService.score += this.currentQuestion.points;
            this.isAnswerCorrect = true;
        }
        this.isTimeOver = true;
    }

    ngOnDestroy(): void {
        this.gameSubscription?.unsubscribe();
    }
}
