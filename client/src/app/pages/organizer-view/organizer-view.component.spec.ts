/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterOutlet } from '@angular/router';
import { QuestionStatsComponent } from '@app/components/question-stats/question-stats.component';
import { GameStats } from '@app/interfaces/game-stats';
import { PLACEHOLDER_GAME_STATS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Subject, of } from 'rxjs';
import { OrganizerViewComponent } from './organizer-view.component';

describe('OrganizerViewComponent', () => {
    let component: OrganizerViewComponent;
    let fixture: ComponentFixture<OrganizerViewComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;

    beforeEach(async () => {
        const timeSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['getStats', 'nextQuestion', 'roundOver', 'onEndRound']);

        const updateUsersSubject = new Subject<GameStats>();
        socketServiceSpy.getStats.and.returnValue(updateUsersSubject.asObservable());
        await TestBed.configureTestingModule({
            declarations: [OrganizerViewComponent, QuestionStatsComponent],
            providers: [
                { provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: TimeService, useValue: timeSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
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

    // it('should call nextQuestion() when the next question button is clicked', () => {
    //     spyOn(component, 'nextQuestion').and.callThrough();
    //     component.questionTimePackage = {
    //         time: 10,
    //         question: { text: 'Question', points: 10, type: 'Type' },
    //         currentQuestionIndex: 0,
    //     };
    //     component.gameStats = PLACEHOLDER_GAME_STATS;
    //     component.isRoundOver = true;
    //     fixture.detectChanges();
    //     const button = fixture.debugElement.nativeElement.querySelector('.next-question-button');
    //     button.click();

    //     expect(component.nextQuestion).toHaveBeenCalled();
    // });

    it('should unsubscribe from updateUsers on completion', fakeAsync(() => {
        component.questionTimePackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'Type' },
            currentQuestionIndex: 0,
        };
        const updateUsersSubject = new Subject<GameStats>();
        socketServiceSpy.getStats.and.returnValue(updateUsersSubject.asObservable());
        component.requestUpdatedStats();

        updateUsersSubject.next(PLACEHOLDER_GAME_STATS);
        updateUsersSubject.complete();

        tick();
        expect(component['socketSubscription'].closed).toBeTruthy();
    }));
});
