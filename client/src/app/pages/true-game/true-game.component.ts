import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Choice, Question, Quiz } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-true-game',
    templateUrl: './true-game.component.html',
    styleUrls: ['./true-game.component.scss'],
})
export class TrueGameComponent implements Quiz, Question, OnInit, Choice {
    game: Quiz;
    questions: Question[] = [];
    questionIndex: number = 0;
    currentQuestion: Question;
    id: string;
    visible: boolean;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    text: string;
    type: string;
    points: number = 0;
    mode: string;
    time: number = 0;
    isRoundFinished: boolean = false;
    isAnswerCorrect: boolean = false;
    readonly bonus: number = 1.2;

    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private readonly gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.gameService.score = 0;
        this.gameService.currentChoices = [];
        let id;
        const url = this.route.snapshot.url.toString();
        if (url.includes('test')) {
            this.mode = 'test';
            id = this.route.snapshot.paramMap.get('id');
        }

        this.quizService.getQuizById(id || '').subscribe((quiz: Quiz) => {
            this.game = quiz;
            if (this.game.questions !== undefined) {
                this.questions = this.game.questions;
            }
            this.time = this.game.duration;
            this.currentQuestion = this.questions[this.questionIndex];
        });
    }

    nextQuestion(isPopupOver: boolean) {
        this.isRoundFinished = isPopupOver;
        this.isAnswerCorrect = isPopupOver;
        this.questionIndex++;
        if (this.questionIndex < this.questions.length) {
            this.currentQuestion = this.questions[this.questionIndex];
        } else {
            this.gameService.score = 0;
            this.router.navigate(['/creategame']);
        }
    }

    calculateScore(isAnswerCorrect: boolean) {
        if (isAnswerCorrect === true) {
            if (this.mode === 'test') {
                this.gameService.score += this.currentQuestion.points * this.bonus;
            }
            this.isAnswerCorrect = true;
        }
        this.isRoundFinished = true;
    }
}
