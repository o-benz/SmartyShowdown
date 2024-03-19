import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogErrorService } from '@app/services/dialog-error-handler/dialog-error.service';
import { RightAnswerPopupComponent } from './right-answer-popup.component';

describe('RightAnswerPopupComponent', () => {
    let component: RightAnswerPopupComponent;
    let fixture: ComponentFixture<RightAnswerPopupComponent>;
    let dialogServiceSpy: jasmine.SpyObj<DialogErrorService>;

    beforeEach(() => {
        dialogServiceSpy = jasmine.createSpyObj('DialogErrorService', ['openErrorDialog', 'getAnswerArray', 'getPointsGained', 'getErrorMessage']);
        TestBed.configureTestingModule({
            declarations: [RightAnswerPopupComponent],
            providers: [{ provide: DialogErrorService, useValue: dialogServiceSpy }],
        });
        fixture = TestBed.createComponent(RightAnswerPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve answerArray from DialogErrorService', () => {
        const testArray = ['Answer1', 'Answer2'];
        dialogServiceSpy.getAnswerArray.and.returnValue(testArray);

        fixture.detectChanges();

        expect(component.answerArray).toEqual(testArray);
        expect(dialogServiceSpy.getAnswerArray).toHaveBeenCalled();
    });

    it('should retrieve errorMessage from DialogErrorService', () => {
        const testError = 'Test error message';
        dialogServiceSpy.getErrorMessage.and.returnValue(testError);

        fixture.detectChanges();

        expect(component.errorMessage).toBe(testError);
        expect(dialogServiceSpy.getErrorMessage).toHaveBeenCalled();
    });

    it('should retrieve pointsGained from DialogErrorService', () => {
        const testPoints = 10;
        dialogServiceSpy.getPointsGained.and.returnValue(testPoints);

        fixture.detectChanges();

        expect(component.pointsGained).toBe(testPoints);
        expect(dialogServiceSpy.getPointsGained).toHaveBeenCalled();
    });
});
