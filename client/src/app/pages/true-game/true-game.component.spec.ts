/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerZoneComponent } from '@app/components/answer-zone/answer-zone.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { QuestionZoneComponent } from '@app/components/question-zone/question-zone.component';
import { User } from '@app/interfaces/socket-model';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, take } from 'rxjs';
// eslint-disable-next-line
import { Component } from '@angular/core';
import { OrganizerViewComponent } from '@app/pages/organizer-view/organizer-view.component';
import { PLACEHOLDER_GAME_STATS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TrueGameComponent } from './true-game.component';

@Component({ standalone: true, selector: 'app-chat-box', template: '' })
class ChatStubComponent {}

describe('TrueGameComponent', () => {
    let component: TrueGameComponent;
    let fixture: ComponentFixture<TrueGameComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let dialogServiceSpy: jasmine.SpyObj<DialogErrorService>;
    // eslint-disable-next-line
    let routeMock: any;
    const durationTest = 60;
    const pointsModifier = 1.2;

    beforeEach(() => {
        const gameSpy = jasmine.createSpyObj('GameService', ['postCurrentChoices']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'getUser',
            'getStats',
            'onChangeQuestion',
            'onFinalizeAnswers',
            'onShowResults',
            'connect',
        ]);
        let internalScore = 0;
        Object.defineProperty(gameSpy, 'score', {
            get: jasmine.createSpy('getScore').and.callFake(() => internalScore),
            set: jasmine.createSpy('setScore').and.callFake((value) => {
                internalScore = value;
            }),
        });
        let internalIsFinalScore = false;
        Object.defineProperty(gameSpy, 'isFinalScore', {
            get: jasmine.createSpy('getIsFinalScore').and.callFake(() => internalIsFinalScore),
            set: jasmine.createSpy('setIsFinalScore').and.callFake((value) => {
                internalIsFinalScore = value;
            }),
        });
        dialogServiceSpy = jasmine.createSpyObj('DialogErrorService', ['closeErrorDialog']);
        const quizSpy = jasmine.createSpyObj('QuizService', ['getQuizById']);
        routeMock = {
            snapshot: {
                url: ['test'],
                paramMap: {
                    get: () => 'test-id',
                },
            },
        };
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            declarations: [TrueGameComponent, AnswerZoneComponent, QuestionZoneComponent, HeaderComponent, OrganizerViewComponent],
            imports: [MatDialogModule, HttpClientTestingModule, ChatStubComponent],
            providers: [
                { provide: ActivatedRoute, useValue: routeMock },
                { provide: Router, useValue: routerSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
                { provide: QuizService, useValue: quizSpy },
                { provide: GameService, useValue: gameSpy },
                { provide: DialogErrorService, useValue: dialogServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(TrueGameComponent);
        component = fixture.componentInstance;
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        quizServiceSpy.getQuizById.and.returnValue(
            of({
                id: 'test-id',
                visible: true,
                title: 'Test Quiz',
                description: 'Test Description',
                duration: 60,
                lastModification: '2024-02-11',
                questions: [
                    {
                        type: 'QCM',
                        text: 'What is 1 + 1?',
                        points: 10,
                        choices: [
                            { text: '1', isCorrect: false },
                            { text: '2', isCorrect: true },
                            { text: '3', isCorrect: false },
                        ],
                    },
                ],
            }),
        );
        gameServiceSpy.postCurrentChoices.and.returnValue(of(true));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update currentQuestion when advancing to the next question', () => {
        const testQuestions = [
            { type: 'QRL', text: 'Question 1', points: 10 },
            { type: 'QRL', text: 'Question 2', points: 10 },
        ];
        component.mode = 'test';
        component.questions = testQuestions;
        component.questionIndex = 0;
        component.nextQuestion(false);
        expect(component.currentQuestion).toEqual(testQuestions[1]);
    });

    it('should go back to quiz selection if game is ended in test mode', () => {
        const testQuestions = [
            { type: 'QRL', text: 'Question 1', points: 10 },
            { type: 'QRL', text: 'Question 2', points: 10 },
        ];
        component.questions = testQuestions;
        component.questionIndex = 1;
        component.mode = 'test';
        component.nextQuestion(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/creategame']);
    });

    it('should calculate score correctly in test mode', () => {
        component.currentQuestion = {
            type: 'Multiple Choice',
            text: 'What is 1 + 1?',
            points: 10,
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
                { text: '3', isCorrect: false },
            ],
        };
        component.mode = 'test';
        component.calculateScore(true);
        expect(gameServiceSpy.score).toEqual(component.currentQuestion.points * pointsModifier);
    });

    it('should calculate score correctly when not in test mode', () => {
        component.currentQuestion = {
            type: 'Multiple Choice',
            text: 'What is 1 + 1?',
            points: 10,
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
                { text: '3', isCorrect: false },
            ],
        };
        component.mode = '';
        component.calculateScore(true);
        expect(gameServiceSpy.score).toEqual(component.currentQuestion.points);
    });

    it('should focus on chat if setFocusOnChat is called', () => {
        component.setFocusOnChat();
        expect(component.isChatFocused).toBeTrue();
        expect(component.isGameFocused).toBeFalse();
    });

    it('should focus on chat if setFocusOnChat is called', () => {
        component.setFocusOnGame();
        expect(component.isChatFocused).toBeFalse();
        expect(component.isGameFocused).toBeTrue();
    });

    it('should go with test mode if the url is for test on Init', fakeAsync(() => {
        const fakeUser: User = {
            username: 'fakeUser123',
            answered: false,
            id: 'user-001',
            room: 'room-101',
            score: 0,
            bonus: 0,
            firstToAnswer: false,
            hasLeft: false,
        };
        socketServiceSpy.getUser.and.returnValue(of(fakeUser));

        socketServiceSpy.onChangeQuestion.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onFinalizeAnswers.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onShowResults.and.callFake((callback) => {
            callback();
        });
        gameServiceSpy.isChoiceFinal = false;
        component.ngOnInit();
        tick();

        expect(component.mode).toEqual('test');
        expect(component.time).toEqual(durationTest);
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
        expect(socketServiceSpy.onChangeQuestion).toHaveBeenCalled();
        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(socketServiceSpy.onShowResults).toHaveBeenCalled();
    }));

    it('should go with test mode if the url is for test on Init', fakeAsync(() => {
        routeMock.snapshot.paramMap = {
            get: () => '',
        };
        const fakeUser: User = {
            username: 'fakeUser123',
            answered: false,
            id: 'user-001',
            room: 'room-101',
            score: 0,
            bonus: 0,
            firstToAnswer: false,
            hasLeft: false,
        };
        socketServiceSpy.getUser.and.returnValue(of(fakeUser));

        socketServiceSpy.onChangeQuestion.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onFinalizeAnswers.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onShowResults.and.callFake((callback) => {
            callback();
        });
        gameServiceSpy.isChoiceFinal = false;
        component.ngOnInit();
        tick();

        expect(component.mode).toEqual('test');
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
        expect(socketServiceSpy.onChangeQuestion).toHaveBeenCalled();
        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(socketServiceSpy.onShowResults).toHaveBeenCalled();
    }));
    it('should use socket if not using test mode on Init', fakeAsync(() => {
        routeMock.snapshot.url = ['live'];

        const fakeUser: User = {
            username: 'fakeUser123',
            answered: false,
            id: 'user-001',
            room: 'room-101',
            score: 0,
            bonus: 0,
            firstToAnswer: false,
            hasLeft: false,
        };
        socketServiceSpy.getUser.and.returnValue(of(fakeUser));

        socketServiceSpy.getStats.and.returnValue(of(PLACEHOLDER_GAME_STATS));

        socketServiceSpy.onChangeQuestion.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onFinalizeAnswers.and.callFake((callback) => {
            callback();
        });

        socketServiceSpy.onShowResults.and.callFake((callback) => {
            callback();
        });
        gameServiceSpy.isChoiceFinal = false;
        component.ngOnInit();
        tick();

        expect(socketServiceSpy.getStats).toHaveBeenCalled();
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
        expect(socketServiceSpy.onChangeQuestion).toHaveBeenCalled();
        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(socketServiceSpy.onShowResults).toHaveBeenCalled();
    }));

    it('should unsubscribe from socketSubscription on completion', () => {
        routeMock.snapshot.url = ['live'];

        const fakeUser: User = {
            username: 'fakeUser123',
            answered: false,
            id: 'user-001',
            room: 'room-101',
            score: 0,
            bonus: 0,
            firstToAnswer: false,
            hasLeft: false,
        };
        socketServiceSpy.getUser.and.returnValue(of(fakeUser));

        socketServiceSpy.getStats.and.returnValue(of(PLACEHOLDER_GAME_STATS).pipe(take(1)));

        const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        component['socketSubscription'] = subscriptionSpy;

        component.ngOnInit();

        expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
    });
});
