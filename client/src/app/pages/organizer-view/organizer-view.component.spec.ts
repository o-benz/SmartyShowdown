/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { QuestionStatsComponent } from '@app/components/question-stats/question-stats.component';
import { GameStats, PlayerInfo } from '@app/interfaces/game-stats';
import { Naviguation } from '@app/interfaces/socket-model';
import { AudioService } from '@app/services/audio-handler/audio.service';
import { PLACEHOLDER_GAME_STATS, PLACEHOLDER_QUESTIONS_STATS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Observable, Subject, of } from 'rxjs';
import { OrganizerViewComponent } from './organizer-view.component';
/* eslint-disable max-lines */

@Component({ standalone: true, selector: 'app-player-list-organiser', template: '' })
class PlayerListStubComponent {
    @Input() players: PlayerInfo[];
}

describe('OrganizerViewComponent', () => {
    let component: OrganizerViewComponent;
    let fixture: ComponentFixture<OrganizerViewComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;

    class MockRouter {
        events: Observable<unknown> = of(new NavigationStart(0, 'some-url'));
        navigateSpy = jasmine.createSpy('navigate');
        async navigate(commands: unknown[]): Promise<boolean> {
            this.navigateSpy(commands);
            return Promise.resolve(true);
        }
    }
    let mockRouter: MockRouter;

    beforeEach(async () => {
        spyOn(HTMLAudioElement.prototype, 'play').and.callFake(async () => {
            return Promise.resolve();
        });
        mockRouter = new MockRouter();
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'getStats',
            'nextQuestion',
            'roundOver',
            'onEndRound',
            'onAnswerChange',
            'disconnect',
            'onUserLeft',
            'endGame',
            'onTick',
            'onPanicEnabled',
            'pauseTimer',
            'paniqueMode',
            'onCorrectQrlQuestions',
            'changeQrlQuestion',
            'givePoints',
            'endCorrection',
        ]);
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playAudio']);
        const updateUsersSubject = new Subject<GameStats>();
        socketServiceSpy.getStats.and.returnValue(updateUsersSubject.asObservable());
        await TestBed.configureTestingModule({
            declarations: [OrganizerViewComponent, QuestionStatsComponent],
            providers: [
                { provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
            ],
            imports: [CommonModule, RouterOutlet, CanvasJSAngularChartsModule, FormsModule, PlayerListStubComponent],
        }).compileComponents();

        timeServiceSpy = TestBed.inject(TimeService) as jasmine.SpyObj<TimeService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(OrganizerViewComponent);
        component = fixture.componentInstance;
        component.endTimerEvent = new EventEmitter<boolean>();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start timer when ngOnChanges is called', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QCM' }, isRoundEnded: false, currentQuestionIndex: 0 };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.startTimer).toHaveBeenCalled();
        expect(component['duration']).toEqual(questionPackage.time);
    });

    it('should unsubscribe timer and game subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpy('unsubscribe');
        component['timerSubscription'] = { unsubscribe: unsubscribeSpy } as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

        component.ngOnDestroy();
        expect(component['timerSubscription']?.unsubscribe).toHaveBeenCalled();
    });

    it('should emit end timer event and post current choices on timer event', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QCM' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        const timeServiceElement = fixture.debugElement.injector.get(TimeService) as TimeService;
        timeServiceElement.timerEvent.emit(true);

        fixture.detectChanges();
        expect(socketServiceSpy.roundOver).toHaveBeenCalled();
    });

    it('should set component properties when ngOnChanges is called with valid question package', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QCM' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        expect(component['duration']).toEqual(questionPackage.time);
        expect(component.points).toEqual(questionPackage.question.points);
    });

    it('should set component properties when ngOnChanges is called with QRL', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QRL' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        // eslint-disable-next-line
        expect(component['duration']).toEqual(60);
        expect(component.points).toEqual(questionPackage.question.points);
    });

    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.navigateHome();
        expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('should handle subscribe to correct methods on Init', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QCM' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnInit();

        expect(socketServiceSpy.onUserLeft).toHaveBeenCalled();
    });

    it('should subscribe to answer changes and update questionStats', () => {
        socketServiceSpy.onAnswerChange.and.callFake((callback) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            callback(PLACEHOLDER_QUESTIONS_STATS.at(0)!);
        });

        component.ngOnInit();

        component.questionStats.subscribe((stats) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(stats).toEqual(PLACEHOLDER_QUESTIONS_STATS.at(0)!);
        });

        expect(socketServiceSpy.onAnswerChange).toHaveBeenCalled();
    });

    it('should update user hasLeft status on onUserLeft event', () => {
        const username = 'testUser';
        component.users = [{ name: username, score: 10, bonusCount: 0, hasLeft: false }];
        socketServiceSpy.onUserLeft.and.callFake((callback) => {
            callback(username);
        });

        component.ngOnInit();

        expect(component.users.find((user) => user.name === username)?.hasLeft).toBeTrue();
    });

    it('should return user on onUserLeft event if there are no username for user', () => {
        const username = 'testUser';
        component.users = [{ name: 'bob', score: 10, bonusCount: 0, hasLeft: false }];
        socketServiceSpy.onUserLeft.and.callFake((callback) => {
            callback(username);
        });

        component.ngOnInit();

        expect(component.users.find((user) => user.name === 'bob')?.hasLeft).toBeFalse();
    });

    it('should set isRoundOver to true, get stats and stop timer on onEndRound event', () => {
        socketServiceSpy.getStats.and.returnValue(of(PLACEHOLDER_GAME_STATS));

        socketServiceSpy.onEndRound.and.callFake((callback) => {
            callback();
        });

        component.ngOnInit();

        expect(component.isRoundOver).toBeTrue();
        expect(socketServiceSpy.getStats).toHaveBeenCalled();
    });

    it('should get stats and stop timer on onCorrectQrlQuestions event', () => {
        socketServiceSpy.getStats.and.returnValue(of(PLACEHOLDER_GAME_STATS));

        socketServiceSpy.onCorrectQrlQuestions.and.callFake((callback) => {
            callback();
        });

        component.ngOnInit();

        expect(socketServiceSpy.getStats).toHaveBeenCalled();
        expect(component.isQrlCorrection).toBeTrue();
    });

    it('should update users on successful updateUsers call', fakeAsync(() => {
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            currentQuestionIndex: 0,
        };
        socketServiceSpy.getStats.and.returnValue(of(PLACEHOLDER_GAME_STATS));
        spyOn(component, 'updateUsersList').and.callThrough();
        component.requestUpdatedStats();
        tick();
        expect(component.updateUsersList).toHaveBeenCalled();
    }));

    it('should call nextQuestion() when the next question button is clicked', () => {
        spyOn(component, 'nextQuestion').and.callThrough();
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QRL' },
            currentQuestionIndex: -2,
        };
        component.gameStats = PLACEHOLDER_GAME_STATS;
        component.isRoundOver = true;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.confirmbtn');
        button.click();

        expect(component.nextQuestion).toHaveBeenCalled();
    });

    it('should call showResults when the show Result button is clicked', () => {
        spyOn(component, 'showResults').and.callThrough();
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QRL' },
            currentQuestionIndex: -1,
        };
        component.gameStats = PLACEHOLDER_GAME_STATS;
        component.isRoundOver = true;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('.confirmbtn');
        button.click();

        expect(component.showResults).toHaveBeenCalled();
    });

    it('should unsubscribe from updateUsers on completion', fakeAsync(() => {
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            currentQuestionIndex: 0,
        };
        const updateUsersSubject = new Subject<GameStats>();
        socketServiceSpy.getStats.and.returnValue(updateUsersSubject.asObservable());
        component.requestUpdatedStats();

        updateUsersSubject.complete();

        tick();
        expect(component['socketSubscription'].closed).toBeTruthy();
    }));

    it('should disconnect socket when back navigation is detected', async () => {
        mockRouter.events = of(new NavigationStart(0, 'some-url'));
        component.ngOnInit();

        mockRouter.events = of(new NavigationStart(1, 'some-url', Naviguation.Back));
        component.ngOnInit();
        expect(socketServiceSpy.disconnect).toHaveBeenCalled();
    });

    it('update user list should update the current and removed user list', async () => {
        const user = { name: 'bob', score: 10, bonusCount: 0, hasLeft: false };
        component.users = [user];

        component.updateUsersList([]);

        expect(component.users.length).toBe(0);
    });

    it('calling givepoints should call givePoints socket', async () => {
        const user = { name: 'bob', score: 10, bonusCount: 0, hasLeft: false };
        component.users = [user];
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'QCM' },
            currentQuestionIndex: 0,
        };

        component.givePoints(0, '0%');

        expect(socketServiceSpy.givePoints).toHaveBeenCalled();
        expect(socketServiceSpy.endCorrection).toHaveBeenCalled();
    });

    it('should not play audio on panic enabled', async () => {
        component.ngOnInit();

        socketServiceSpy.onPanicEnabled.and.callFake((callback: (isPanicEnabled: boolean) => void) => {
            callback(false);
        });

        component.ngOnInit();

        component.isPaused = true;

        expect(audioServiceSpy.playAudio).not.toHaveBeenCalled();
        expect(component.isPaused).toBeTruthy();
        expect(component.isPanic).toBeFalsy();
    });

    it('should play audio on panic enabled', () => {
        component.isPaused = true;
        socketServiceSpy.onPanicEnabled.and.callFake((callback) => callback(true));

        component.ngOnInit();
        expect(component.isPaused).toBeFalse();
        expect(component.isPanic).toBeTrue();
    });

    it('should pause timer', () => {
        component.pauseTimer();
        expect(component.isPaused).toBe(true);
        expect(socketServiceSpy.pauseTimer).toHaveBeenCalled();
    });

    it('should panic', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'QCM' }, isRoundEnded: false, currentQuestionIndex: 0 };
        component.questionTimePackage = questionPackage;
        timeServiceSpy['time'] = questionPackage.time;
        component.paniqueMode();
        expect(socketServiceSpy.paniqueMode).toHaveBeenCalledWith(0, 0);
    });
});
