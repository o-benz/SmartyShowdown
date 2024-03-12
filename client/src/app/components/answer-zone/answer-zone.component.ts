import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-answer-zone',
    templateUrl: './answer-zone.component.html',
    styleUrls: ['./answer-zone.component.scss'],
})
export class AnswerZoneComponent implements OnChanges, OnDestroy {
    @Input() roundEndedQuestionPackage: { isRoundEnded: boolean; question: Question; questionIndex: number };
    @Output() qcmFinishedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() qrlFinishedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    choices: Choice[] = [];
    textAnswer: string = '';
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-magic-numbers
    EVENT_KEY_BASE = 10;
    private gameSubscription: Subscription | undefined;

    constructor(
        private gameService: GameService,
        private socketService: SocketCommunicationService,
    ) {}
    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.lockAnswer();
        }
        if (event.key >= '1' && event.key <= '4') {
            this.chooseChoice(parseInt(event.key, this.EVENT_KEY_BASE) - 1);
        }
    }
    ngOnChanges(): void {
        if (this.roundEndedQuestionPackage.question) {
            this.initQuestion();
            this.gameService.currentChoices = [];
            this.gameService.isChoiceFinal = false;
            this.textAnswer = '';
            if (this.roundEndedQuestionPackage.isRoundEnded) {
                this.gameService.currentChoices = [];
            }
        }
    }

    ngOnDestroy(): void {
        this.gameSubscription?.unsubscribe();
    }
    chooseChoice(index: number) {
        this.socketService.addAnswer(index - 1, this.roundEndedQuestionPackage.questionIndex);
        if (!this.gameService.isChoiceFinal) {
            const indexNotFound = -1;
            const choiceIndex = this.gameService.currentChoices?.indexOf(this.choices[index]);
            if (choiceIndex !== indexNotFound) {
                this.gameService.currentChoices?.splice(choiceIndex, 1);
            } else {
                this.gameService.currentChoices?.push(this.choices[index]);
            }
        }
    }
    initQuestion() {
        if (
            this.roundEndedQuestionPackage.question &&
            this.roundEndedQuestionPackage.question.choices &&
            this.roundEndedQuestionPackage.question.type === 'QCM'
        ) {
            this.choices = this.roundEndedQuestionPackage.question.choices;
        }
    }
    lockAnswer() {
        if ((this.gameService.currentChoices && this.gameService.currentChoices.length > 0) || this.textAnswer) {
            if (!this.gameService.isChoiceFinal) {
                this.socketService.confirmAnswer();
                this.gameSubscription = this.gameService
                    .postCurrentChoices(this.roundEndedQuestionPackage.question.text)
                    .subscribe((isAnswerCorrect: boolean) => {
                        this.qcmFinishedEvent.emit(isAnswerCorrect);
                    });
            }
        }
    }
    isChoiceSelected(choice: Choice): boolean {
        return !!this.gameService.currentChoices && this.gameService.currentChoices.includes(choice);
    }
}
