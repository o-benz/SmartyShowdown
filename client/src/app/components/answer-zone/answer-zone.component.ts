import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseQuestion, Choice } from '@app/interfaces/question-model';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subscription } from 'rxjs';

const EVENT_KEY_BASE = 10;
const INDEX_NOT_FOUND = -1;

@Component({
    selector: 'app-answer-zone',
    templateUrl: './answer-zone.component.html',
    styleUrls: ['./answer-zone.component.scss'],
})
export class AnswerZoneComponent implements OnChanges, OnDestroy, OnInit {
    @Input() roundEndedQuestionPackage: { isRoundEnded: boolean; question: BaseQuestion; questionIndex: number; mode: string };
    @Output() qcmFinishedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() isRandom: boolean;
    choices: Choice[] = [];
    textAnswer: string = '';
    username: string;
    private gameSubscription: Subscription | undefined;

    constructor(
        private gameService: GameService,
        private socketService: SocketCommunicationService,
    ) {}

    @HostListener('window:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.roundEndedQuestionPackage.question.type === 'QCM') {
            if (event.key === 'Enter') {
                this.lockAnswer();
            } else if (event.key >= '1' && event.key <= '4') {
                this.chooseChoice(parseInt(event.key, EVENT_KEY_BASE) - 1);
            }
        } else if (this.roundEndedQuestionPackage.question.type === 'QRL') {
            this.socketService.makeUserActive(this.roundEndedQuestionPackage.questionIndex);
        }
    }

    ngOnInit(): void {
        this.socketService.getUser().subscribe({
            next: (value) => {
                this.username = value.username;
            },
        });
        this.socketService.onFinalizeAnswers(() => {
            if ((this.username !== 'organisateur' || this.isRandom) && !this.gameService.isChoiceFinal) {
                this.gameService.isChoiceFinal = true;

                if (this.roundEndedQuestionPackage.question.type === 'QCM') {
                    this.socketService.confirmAnswer(this.roundEndedQuestionPackage.questionIndex);
                } else if (this.roundEndedQuestionPackage.question.type === 'QRL') {
                    this.socketService.sendTextAnswer(this.textAnswer);
                    this.socketService.confirmAnswer(this.roundEndedQuestionPackage.questionIndex);
                }
            }
        });
    }

    ngOnChanges(): void {
        if (this.roundEndedQuestionPackage.question) {
            if (this.roundEndedQuestionPackage.question.type === 'QCM')
                this.choices = this.roundEndedQuestionPackage.question.choices ? this.roundEndedQuestionPackage.question.choices : [];
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
        if (!this.gameService.isChoiceFinal) {
            this.socketService.addAnswer(index, this.roundEndedQuestionPackage.questionIndex);
            const choiceIndex = this.gameService.currentChoices?.indexOf(this.choices[index]);
            if (choiceIndex !== INDEX_NOT_FOUND) {
                this.gameService.currentChoices?.splice(choiceIndex, 1);
            } else {
                this.gameService.currentChoices?.push(this.choices[index]);
            }
        }
    }

    lockAnswer() {
        if (this.canAnswerBeSubmitted()) {
            if (this.roundEndedQuestionPackage.question.type === 'QCM') {
                this.socketService.confirmAnswer(this.roundEndedQuestionPackage.questionIndex);
                this.gameService.isChoiceFinal = true;
            } else if (this.roundEndedQuestionPackage.question.type === 'QRL') {
                this.gameService.isChoiceFinal = true;
                this.socketService.sendTextAnswer(this.textAnswer);
                this.socketService.confirmAnswer(this.roundEndedQuestionPackage.questionIndex);
            }
            if (this.roundEndedQuestionPackage.mode === 'test')
                this.gameSubscription = this.gameService
                    .postCurrentChoices(this.roundEndedQuestionPackage.question.text)
                    .subscribe((isAnswerCorrect: boolean) => {
                        this.qcmFinishedEvent.emit(isAnswerCorrect);
                    });
        }
    }

    canAnswerBeSubmitted(): boolean {
        if (((this.gameService.currentChoices && this.gameService.currentChoices.length > 0) || this.textAnswer) && !this.gameService.isChoiceFinal) {
            return true;
        }
        return false;
    }

    isChoiceSelected(choice: Choice): boolean {
        return !!this.gameService.currentChoices && this.gameService.currentChoices.includes(choice);
    }
}
