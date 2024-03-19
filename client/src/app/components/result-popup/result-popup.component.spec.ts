/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { TimeService } from '@app/services/time/time.service';
import { ResultPopupComponent } from './result-popup.component';

describe('ResultPopupComponent', () => {
    let component: ResultPopupComponent;
    let fixture: ComponentFixture<ResultPopupComponent>;
    let errorServiceSpy: jasmine.SpyObj<DialogErrorService>;

    beforeEach(() => {
        const timeSpy = jasmine.createSpyObj('timeServiceSpy', ['timerEvent']);
        TestBed.configureTestingModule({
            declarations: [ResultPopupComponent],
            providers: [
                { provide: TimeService, useValue: timeSpy },
                { provide: DialogErrorService, useValue: jasmine.createSpyObj('DialogErrorService', ['closeErrorDialog']) },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultPopupComponent);
        errorServiceSpy = TestBed.inject(DialogErrorService) as jasmine.SpyObj<DialogErrorService>;
        errorServiceSpy.closeErrorDialog.and.returnValue();
        component = fixture.componentInstance;
        component.questionBooleanPackage = { isAnswerCorrect: false, question: { type: '', text: '', points: 0 } };
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize timer on ngOnChanges', () => {
        spyOn(component, 'timerInit').and.callThrough();
        component.ngOnChanges();
        expect(component.timerInit).toHaveBeenCalled();
    });

    it('should unsubscribe and stop timer on ngOnDestroy', () => {
        component['timerSubscription'] = {
            unsubscribe: jasmine.createSpy('unsubscribe'),
        } as any;
        component.ngOnDestroy();

        expect(component['timerSubscription']?.unsubscribe).toHaveBeenCalled();
    });

    it('should emit next question event on timer event', () => {
        spyOn(component.nextQuestionEvent, 'emit');
        component.nextQuestion();
        expect(component.nextQuestionEvent.emit).toHaveBeenCalledWith(false);
    });

    it('should reset isAnswerCorrect on nextQuestion', () => {
        component.questionBooleanPackage.isAnswerCorrect = true;
        component.nextQuestion();
        expect(component.questionBooleanPackage.isAnswerCorrect).toBe(false);
    });
    it('should subscribe to timerEvent on ngOnChanges', () => {
        spyOn(component, 'nextQuestion');
        component.ngOnChanges();
        const timeServiceElement = fixture.debugElement.injector.get(TimeService) as TimeService;
        timeServiceElement.timerEvent.emit(true);

        fixture.detectChanges();
        expect(component.nextQuestion).toHaveBeenCalled();
    });
});
