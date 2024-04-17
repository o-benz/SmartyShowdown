import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '@app/interfaces/socket-model';
import { CountdownService } from '@app/services/countdown/countdown.service';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { Subject, of } from 'rxjs';
import { ResultPopupComponent } from './result-popup.component';

describe('ResultPopupComponent', () => {
    let component: ResultPopupComponent;
    let fixture: ComponentFixture<ResultPopupComponent>;
    let countdownServiceSpy: jasmine.SpyObj<CountdownService>;
    let mockDialogAlertService: jasmine.SpyObj<DialogAlertService>;
    let countdownEndedSubject: Subject<void>;
    let countdownTickSubject: Subject<number>;
    let mockSocketServer: jasmine.SpyObj<SocketCommunicationService>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        countdownEndedSubject = new Subject<void>();
        countdownTickSubject = new Subject<number>();
        mockDialogAlertService = jasmine.createSpyObj('DialogAlertService', ['closeAlertDialog', 'openErrorDialog']);

        const countdownSpy = jasmine.createSpyObj('CountdownService', ['startCountdown', 'stopCountdown']);
        countdownSpy.countdownTick = countdownTickSubject.asObservable();
        countdownSpy.countdownEnded = countdownEndedSubject.asObservable();

        mockSocketServer = jasmine.createSpyObj('SocketCommunicationService', ['getUser']);
        mockGameService = jasmine.createSpyObj('GameService', ['staysInInterval']);
        mockGameService.score = 0;

        TestBed.configureTestingModule({
            declarations: [ResultPopupComponent],
            providers: [
                { provide: CountdownService, useValue: countdownSpy },
                { provide: DialogAlertService, useValue: mockDialogAlertService },
                { provide: SocketCommunicationService, useValue: mockSocketServer },
                { provide: GameService, useValue: mockGameService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultPopupComponent);
        component = fixture.componentInstance;
        component.questionBooleanPackage = { isAnswerCorrect: false, question: { type: '', text: '', points: 0 } };
        countdownServiceSpy = TestBed.inject(CountdownService) as jasmine.SpyObj<CountdownService>;
        mockDialogAlertService = TestBed.inject(DialogAlertService) as jasmine.SpyObj<DialogAlertService>;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        countdownEndedSubject.complete();
        countdownTickSubject.complete();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call closeAlertDialog on ngOnChanges', () => {
        component.ngOnChanges();
        expect(mockDialogAlertService.closeAlertDialog).toHaveBeenCalled();
    });

    it('should initialize countdown on ngOnChanges', () => {
        component.ngOnChanges();
        expect(countdownServiceSpy.startCountdown).toHaveBeenCalledWith(3);
    });

    it('should update popupDuration on countdown tick', () => {
        component.ngOnChanges();
        countdownTickSubject.next(2);
        expect(component.popupDuration).toBe(2);
    });

    it('should emit nextQuestionEvent and reset isAnswerCorrect on countdown end', () => {
        spyOn(component.nextQuestionEvent, 'emit');
        component.ngOnChanges();
        countdownEndedSubject.next();
        expect(component.nextQuestionEvent.emit).toHaveBeenCalledWith(false);
        expect(component.questionBooleanPackage.isAnswerCorrect).toBeFalse();
    });

    it('should unsubscribe from countdown subscriptions on ngOnDestroy', () => {
        component.ngOnChanges();
        component.ngOnDestroy();
        expect(component.countdownEndedSubscription.closed).toBeTruthy();
        expect(component.countdownTickSubscription.closed).toBeTruthy();
    });

    it('should call makePopup when isRandom is false', () => {
        component.isRandom = false;

        const spy = spyOn(component, 'makePopup');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
    });

    it('should call makePopup and not set isFirstAnswer when isRandom is true and score does not trigger isFirstAnswer', () => {
        component.isRandom = true;
        mockSocketServer.getUser.and.returnValue(of({ score: 10 } as User));
        const spy = spyOn(component, 'makePopup');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
        expect(component['isFirstAnswer']).toBeTruthy();
    });

    it('should call makePopup and set isFirstAnswer when isRandom is true and score triggers isFirstAnswer', () => {
        component.isRandom = true;
        mockGameService.score = 0;
        component.questionBooleanPackage.question.points = 5;
        mockSocketServer.getUser.and.returnValue(of({ score: 15 } as User));
        const spy = spyOn(component, 'makePopup');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
        expect(component['isFirstAnswer']).toBeTrue();
    });

    it('should give 0 for undefined value', () => {
        component.isRandom = true;
        mockGameService.score = 0;
        component.questionBooleanPackage.question.points = 5;
        mockSocketServer.getUser.and.returnValue(of({ score: undefined } as User));
        const spy = spyOn(component, 'makePopup');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
        expect(component['isFirstAnswer']).toBeFalse();
    });
});
