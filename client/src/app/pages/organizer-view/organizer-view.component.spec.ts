/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { QuestionStatsComponent } from '@app/components/question-stats/question-stats.component';
import { GameStats } from '@app/interfaces/game-stats';
import { Naviguation } from '@app/interfaces/socket-model';
import { PLACEHOLDER_GAME_STATS, PLACEHOLDER_QUESTIONS_STATS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Observable, Subject, of } from 'rxjs';
import { OrganizerViewComponent } from './organizer-view.component';

describe('OrganizerViewComponent', () => {
    let component: OrganizerViewComponent;
    let fixture: ComponentFixture<OrganizerViewComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

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
        ]);

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
            imports: [CommonModule, RouterOutlet, CanvasJSAngularChartsModule],
        }).compileComponents();

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(OrganizerViewComponent);
        component = fixture.componentInstance;
        component.endTimerEvent = new EventEmitter<boolean>();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start timer when ngOnChanges is called', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isRoundEnded: false, currentQuestionIndex: 0 };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.startTimer).toHaveBeenCalled();
        expect(component.duration).toEqual(questionPackage.time);
    });

    it('should unsubscribe timer and game subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpy('unsubscribe');
        component.timerSubscription = { unsubscribe: unsubscribeSpy } as any;

        component.ngOnDestroy();
        expect(component.timerSubscription?.unsubscribe).toHaveBeenCalled();
    });

    it('should emit end timer event and post current choices on timer event', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        const timeServiceElement = fixture.debugElement.injector.get(TimeService) as TimeService;
        timeServiceElement.timerEvent.emit(true);

        fixture.detectChanges();
    });

    it('should set component properties when ngOnChanges is called with valid question package', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isRoundEnded: false, currentQuestionIndex: 1 };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        expect(component.duration).toEqual(questionPackage.time);
        expect(component.points).toEqual(questionPackage.question.points);
    });

    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.navigateHome();
        expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('should handle subscribe to correct methods on Init', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isRoundEnded: false, currentQuestionIndex: 1 };
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

    it('should return user  on onUserLeft event if there are no username for user', () => {
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

    it('should update users on successful updateUsers call', fakeAsync(() => {
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'Type' },
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
            question: { text: 'Question', points: 10, type: 'Type' },
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
            question: { text: 'Question', points: 10, type: 'Type' },
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
            question: { text: 'Question', points: 10, type: 'Type' },
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
});
