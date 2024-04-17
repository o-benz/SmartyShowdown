import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { QuestionZoneComponent } from '@app/components/question-zone/question-zone.component';
import { GameStats, PlayerInfo, QuestionStats } from '@app/interfaces/game-stats';
import { AudioService } from '@app/services/audio-handler/audio.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject, of } from 'rxjs';
/* eslint-disable max-lines */
describe('QuestionZoneComponent', () => {
    let component: QuestionZoneComponent;
    let fixture: ComponentFixture<QuestionZoneComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let dialogServiceSpy: jasmine.SpyObj<DialogAlertService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let emitterSpy: jasmine.SpyObj<EventEmitter<boolean>>;

    beforeEach(async () => {
        dialogServiceSpy = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog', 'openCustomDialog', 'openSimpleDialog']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'getUser',
            'disconnect',
            'onEndRound',
            'onTick',
            'onPanicEnabled',
            'onCorrectQrlQuestions',
            'roundOver',
            'getStats',
            'endGame',
            'nextQuestion',
        ]);
        const gameSpy = jasmine.createSpyObj('GameService', ['postCurrentChoices', 'getAnswers']);
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playAudio']);
        let internalScore = 0;
        Object.defineProperty(gameSpy, 'score', {
            get: jasmine.createSpy('getScore').and.callFake(() => internalScore),
            set: jasmine.createSpy('setScore').and.callFake((value) => {
                internalScore = value;
            }),
        });
        await TestBed.configureTestingModule({
            declarations: [QuestionZoneComponent],
            providers: [
                { provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameSpy },
                { provide: DialogAlertService, useValue: dialogServiceSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: EventEmitter, useValue: jasmine.createSpyObj('EventEmitter', ['subscribe', 'unsubscribe']) },
            ],
        }).compileComponents();

        emitterSpy = TestBed.inject(EventEmitter) as jasmine.SpyObj<EventEmitter<boolean>>;
        timeServiceSpy = TestBed.inject(TimeService) as jasmine.SpyObj<TimeService>;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(QuestionZoneComponent);
        component = fixture.componentInstance;
        gameServiceSpy.postCurrentChoices.and.returnValue(of(true));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start timer when ngOnChanges is called', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.time).toBeGreaterThan(0);
    });

    it('should update score if in test mode', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: 'test',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.time).toBeGreaterThan(0);
    });
    it('should handle onEndRound and getUser onInit', fakeAsync(() => {
        const mockValue = { score: 100, username: 'bob', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            isOrganizer: false,
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        let onEndRoundCallback: (() => void) | undefined;
        socketServiceSpy.onEndRound.and.callFake((callback: () => void) => {
            onEndRoundCallback = callback;
        });
        socketServiceSpy.getUser.and.returnValue(of(mockValue));

        component.ngOnInit();
        if (onEndRoundCallback !== undefined) {
            onEndRoundCallback();
        }
        tick();
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
        expect(component.score).toBe(mockValue.score);
    }));

    it('should handle QrlCorrection and getUser onInit', fakeAsync(() => {
        const mockValue = { score: 100, username: 'bob', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            isOrganizer: false,
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        let onCorrectQrlQuestionsCallback: (() => void) | undefined;
        socketServiceSpy.onCorrectQrlQuestions.and.callFake((callback: () => void) => {
            onCorrectQrlQuestionsCallback = callback;
        });
        socketServiceSpy.getUser.and.returnValue(of(mockValue));

        component.ngOnInit();
        if (onCorrectQrlQuestionsCallback !== undefined) {
            onCorrectQrlQuestionsCallback();
        }
        tick();
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
    }));

    it('should handle onEndRound and getUser onInit and if score is undefined', fakeAsync(() => {
        const mockValue = { score: undefined, username: 'bob', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            isOrganizer: false,
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        let onEndRoundCallback: (() => void) | undefined;
        socketServiceSpy.onEndRound.and.callFake((callback: () => void) => {
            onEndRoundCallback = callback;
        });
        socketServiceSpy.getUser.and.returnValue(of(mockValue));

        component.ngOnInit();
        if (onEndRoundCallback !== undefined) {
            onEndRoundCallback();
        }
        tick();
        expect(socketServiceSpy.getUser).toHaveBeenCalled();
        expect(component.score).toBe(0);
    }));

    it('should only change score when ngOnChanges is called when the round is ended', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: true,
            mode: 'test',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;
        spyOn(component, 'startTimer').and.callThrough();
        component.ngOnChanges();
        expect(component.score).toBe(gameServiceSpy.score);
        expect(component.startTimer).not.toHaveBeenCalled();
    });

    it('should set component properties when ngOnChanges is called with valid question package', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        expect(component.duration).toEqual(questionPackage.time);
        expect(component.points).toEqual(questionPackage.question.points);
    });

    it('should set time to 60 when ngOnChanges is called with QRL', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QRL' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        // eslint-disable-next-line
        expect(component.duration).toEqual(60);
    });

    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.navigateHome();
        expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('should emit end timer event and post current choices on timer event', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: 'test',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        const timeServiceElement = fixture.debugElement.injector.get(TimeService) as TimeService;
        timeServiceElement.timerEvent.emit(true);

        fixture.detectChanges();
        expect(gameServiceSpy.postCurrentChoices).toHaveBeenCalled();
    });

    it('should play audio on panic enabled', async () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: 'test',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnInit();

        socketServiceSpy.onPanicEnabled.and.callFake((callback: (isPanicEnabled: boolean) => void) => {
            callback(true);
        });

        component.ngOnInit();

        expect(audioServiceSpy.playAudio).toHaveBeenCalled();
    });

    it('should not play audio on panic enabled', async () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: 'test',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnInit();

        socketServiceSpy.onPanicEnabled.and.callFake((callback: (isPanicEnabled: boolean) => void) => {
            callback(false);
        });

        component.ngOnInit();

        expect(audioServiceSpy.playAudio).not.toHaveBeenCalled();
    });

    it('should call requestUpdatedStats and start timer when isRandom is true', async () => {
        component.isRandom = true;
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        const spy: EventEmitter<boolean> = new EventEmitter<boolean>();
        component.questionTimePackage = questionPackage;
        spyOn(component, 'requestUpdatedStats');
        spyOn(component, 'startTimer');

        component.timerSubscription = spy.subscribe();
        timeServiceSpy.timerEvent = emitterSpy;
        spyOn(component['timeService'].timerEvent, 'subscribe').and.callFake((callback) => callback(true));

        component.ngOnChanges();

        expect(socketServiceSpy.roundOver).toHaveBeenCalled();
        expect(component.requestUpdatedStats).toHaveBeenCalled();
        expect(component.startTimer).toHaveBeenCalled();
    });

    it('should set component properties when questionTimePackage is valid and not in test mode', () => {
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        expect(component.duration).toEqual(questionPackage.time);
        expect(component.points).toEqual(questionPackage.question.points);
    });

    it('should call endGame method of SocketService when showResults is called', () => {
        component.showResults();
        expect(component['socketService'].endGame).toHaveBeenCalled();
    });

    it('should update users list properly', () => {
        const users: PlayerInfo[] = [{ name: 'John' }, { name: 'Alice' }, { name: 'Bob' }];
        component.updateUsersList(users);
        expect(component.users).toEqual(users);
        const newUser: PlayerInfo = { name: 'Eve' };
        const updatedUsersWithNewUser = [...users, newUser];
        component.updateUsersList(updatedUsersWithNewUser);
        expect(component.users).toEqual(updatedUsersWithNewUser);
        const usersAfterRemoval = updatedUsersWithNewUser.slice(0, 2);
        component.updateUsersList(usersAfterRemoval);
        expect(component.users).toEqual(usersAfterRemoval);
        component.updateUsersList(usersAfterRemoval);
        expect(component.users).toEqual(usersAfterRemoval);
    });

    it('should request updated stats and handle gameStats properly', fakeAsync(() => {
        const gameStats: GameStats = {
            id: '',
            duration: 0,
            name: '',
            questions: [
                { title: '', type: '', points: 0, statLines: [] },
                { title: '', type: '', points: 0, statLines: [] },
            ],
            users: [{ name: '' }, { name: '' }],
        };
        const getStatsObservable = new Subject<GameStats>();
        socketServiceSpy.getStats.and.returnValue(getStatsObservable);
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        spyOn(component.questionStats, 'next');
        spyOn(component, 'updateUsersList');

        component.requestUpdatedStats();
        getStatsObservable.next(gameStats);
        tick();
        getStatsObservable.complete();
        tick();

        expect(component.gameStats).toEqual(gameStats);
        expect(component.questionStats.next).toHaveBeenCalledWith(gameStats.questions[0]);
        expect(component.updateUsersList).toHaveBeenCalledWith(gameStats.users);
    }));

    it('should handle round end when isRandom is true', fakeAsync(() => {
        const mockValue = { score: 100, username: 'organisateur', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 0,
        };
        component.questionTimePackage = questionPackage;
        component.isRandom = true;
        component.gameStats = {
            id: '',
            duration: 0,
            name: '',
            questions: [{}, {}, {}] as QuestionStats[],
            users: [],
        };
        let onEndRoundCallback: (() => void) | undefined;
        socketServiceSpy.onEndRound.and.callFake((callback: () => void) => {
            onEndRoundCallback = callback;
        });
        socketServiceSpy.getUser.and.returnValue(of(mockValue));
        component.ngOnInit();
        spyOn(component.endTimerEvent, 'emit');
        spyOn(component, 'showResults');

        if (onEndRoundCallback !== undefined) {
            onEndRoundCallback();
        }
        tick();
        expect(component.endTimerEvent.emit).toHaveBeenCalledWith(true);
        expect(component.showResults).not.toHaveBeenCalled();
        expect(socketServiceSpy.nextQuestion).toHaveBeenCalled();
    }));

    it('should emit endTimerEvent and not call showResults when isRandom is true and currentQuestionIndex equals the last question index', () => {
        const mockValue = { score: 100, username: 'organisateur', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            isTimeOver: false,
            mode: '',
            currentQuestionIndex: 2,
        };
        component.questionTimePackage = questionPackage;
        component.isRandom = true;
        component.gameStats = {
            id: '',
            duration: 0,
            name: '',
            questions: [{}, {}, {}] as QuestionStats[],
            users: [],
        };
        let onEndRoundCallback: (() => void) | undefined;
        socketServiceSpy.onEndRound.and.callFake((callback: () => void) => {
            onEndRoundCallback = callback;
        });
        socketServiceSpy.getUser.and.returnValue(of(mockValue));

        component.handleRoundEnd();

        spyOn(component.endTimerEvent, 'emit');
        spyOn(component, 'showResults');

        if (onEndRoundCallback !== undefined) {
            onEndRoundCallback();
        }

        expect(component.endTimerEvent.emit).toHaveBeenCalledWith(true);
        expect(component.showResults).toHaveBeenCalled();
    });
});
