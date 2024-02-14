import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-answer-zone',
    templateUrl: './answer-zone.component.html',
    styleUrls: ['./answer-zone.component.scss'],
})
export class AnswerZoneComponent implements Choice, Question, OnChanges, OnDestroy {
    @Input() currentQuestion: Question;
    @Output() qcmFinishedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() qrlFinishedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    questionIndex: number = 0;
    choices: Choice[] = [];
    duration: number;
    isAnswerLocked: boolean = false;
    text: string;
    type: string;
    points: number;
    textAnswer: string = '';
    private gameSubscription: Subscription | undefined;

    constructor(private gameService: GameService) {}
    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.lockAnswer();
        }
        if (event.key === '1') {
            this.chooseChoice(0);
        }
        if (event.key === '2') {
            this.chooseChoice(1);
        }
        if (event.key === '3') {
            this.chooseChoice(2);
        }
        if (event.key === '4') {
            this.chooseChoice(3);
        }
    }
    ngOnChanges(): void {
        this.initQuestion();
        this.isAnswerLocked = false;
        this.gameService.currentChoices = [];
        this.textAnswer = '';
    }

    ngOnDestroy(): void {
        this.gameSubscription?.unsubscribe();
    }
    chooseChoice(index: number) {
        if (!this.isAnswerLocked) {
            const indexNotFound = -1;
            const choiceIndex = this.gameService.currentChoices?.indexOf(this.choices[index]);
            if (choiceIndex !== undefined && choiceIndex !== indexNotFound) {
                this.gameService.currentChoices?.splice(choiceIndex, 1);
            } else {
                this.gameService.currentChoices?.push(this.choices[index]);
            }
        }
    }
    initQuestion() {
        if (this.currentQuestion && this.currentQuestion.choices && this.currentQuestion.type === 'QCM') {
            this.choices = this.currentQuestion.choices;
        }
    }
    lockAnswer() {
        if ((this.gameService.currentChoices && this.gameService.currentChoices.length > 0) || this.textAnswer) {
            this.isAnswerLocked = true;
            this.nextQuestion();
        }
    }
    isChoiceSelected(choice: Choice): boolean {
        return !!this.gameService.currentChoices && this.gameService.currentChoices.includes(choice);
    }
    nextQuestion() {
        if (this.currentQuestion.type === 'QCM') {
            this.gameSubscription = this.gameService.postCurrentChoices(this.currentQuestion).subscribe((isAnswerCorrect: boolean) => {
                this.qcmFinishedEvent.emit(isAnswerCorrect);
            });
        }
        if (this.currentQuestion.type === 'QRL') this.qrlFinishedEvent.emit(true);
    }
}
