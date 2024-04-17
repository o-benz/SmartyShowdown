import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { RightAnswerPopupComponent } from './right-answer-popup.component';

describe('RightAnswerPopupComponent', () => {
    let component: RightAnswerPopupComponent;
    let fixture: ComponentFixture<RightAnswerPopupComponent>;
    let dialogServiceSpy: jasmine.SpyObj<DialogAlertService>;

    beforeEach(() => {
        dialogServiceSpy = jasmine.createSpyObj('DialogAlertService', [
            'openErrorDialog',
            'getAnswerArray',
            'getPointsGained',
            'getAlertMessage',
            'getAlertArray',
        ]);
        TestBed.configureTestingModule({
            declarations: [RightAnswerPopupComponent],
            providers: [{ provide: DialogAlertService, useValue: dialogServiceSpy }],
        });
        fixture = TestBed.createComponent(RightAnswerPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve answerArray from DialogAlertService', () => {
        const testArray = ['Answer1', 'Answer2'];
        dialogServiceSpy.getAlertArray.and.returnValue(testArray);

        fixture.detectChanges();

        expect(component.answerArray).toEqual(testArray);
        expect(dialogServiceSpy.getAlertArray).toHaveBeenCalled();
    });

    it('should retrieve errorMessage from DialogalertService', () => {
        const testError = 'Test error message';
        dialogServiceSpy.getAlertMessage.and.returnValue(testError);

        fixture.detectChanges();

        expect(component.errorMessage).toBe(testError);
        expect(dialogServiceSpy.getAlertMessage).toHaveBeenCalled();
    });

    it('should retrieve pointsGained from DialogAlertService', () => {
        const testPoints = 10;
        dialogServiceSpy.getPointsGained.and.returnValue(testPoints);

        fixture.detectChanges();

        expect(component.pointsGained).toBe(testPoints);
        expect(dialogServiceSpy.getPointsGained).toHaveBeenCalled();
    });
});
