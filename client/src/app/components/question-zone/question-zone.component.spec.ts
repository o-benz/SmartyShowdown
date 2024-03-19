/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { TimeService } from '@app/services/time/time.service';
import { of } from 'rxjs';
import { QuestionZoneComponent } from './question-zone.component';

describe('QuestionZoneComponent', () => {
    let component: QuestionZoneComponent;
    let fixture: ComponentFixture<QuestionZoneComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let dialogServiceSpy: jasmine.SpyObj<DialogErrorService>;

    beforeEach(async () => {
        dialogServiceSpy = jasmine.createSpyObj('DialogErrorService', ['openCustomDialog']);
        const timeSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['getUser', 'disconnect', 'onEndRound', 'onTick']);
        const gameSpy = jasmine.createSpyObj('GameService', ['postCurrentChoices', 'getAnswers']);
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
                { provide: TimeService, useValue: timeSpy },
                { provide: GameService, useValue: gameSpy },
                { provide: DialogErrorService, useValue: dialogServiceSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

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
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false, mode: '' };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.time).toBeGreaterThan(0);
    });

    it('should update score if in test mode', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false, mode: 'test' };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.time).toBeGreaterThan(0);
    });
    it('should handle onEndRound and getUser onInit', fakeAsync(() => {
        const mockValue = { score: 100, username: 'bob', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'Type' },
            isTimeOver: false,
            mode: '',
            isOrganizer: false,
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

    it('should handle onEndRound and getUser onInit and if score is undefined', fakeAsync(() => {
        const mockValue = { score: undefined, username: 'bob', answered: false };
        const questionPackage = {
            time: 10,
            question: { text: 'Question', points: 10, type: 'Type' },
            isTimeOver: false,
            mode: '',
            isOrganizer: false,
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
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: true, mode: 'test' };
        component.questionTimePackage = questionPackage;
        spyOn(component, 'startTimer').and.callThrough();
        component.ngOnChanges();
        expect(component.score).toBe(gameServiceSpy.score);
        expect(component.startTimer).not.toHaveBeenCalled();
    });

    it('should set component properties when ngOnChanges is called with valid question package', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false, mode: '' };
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

    it('should emit end timer event and post current choices on timer event', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false, mode: 'test' };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        const timeServiceElement = fixture.debugElement.injector.get(TimeService) as TimeService;
        timeServiceElement.timerEvent.emit(true);

        fixture.detectChanges();
        expect(gameServiceSpy.postCurrentChoices).toHaveBeenCalled();
    });
});
