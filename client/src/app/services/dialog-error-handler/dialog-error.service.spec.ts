import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RightAnswerPopupComponent } from '@app/components/right-answer-popup/right-answer-popup.component';
import { DialogErrorService } from './dialog-error.service';

describe('DialogErrorService', () => {
    let service: DialogErrorService;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [DialogErrorService, { provide: MatDialog, useValue: mockMatDialog }],
        });
        service = TestBed.inject(DialogErrorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get error message correctly', () => {
        const testMessage = 'Error occurred';
        service.setErrorMessage(testMessage);
        expect(service.getErrorMessage()).toBe(testMessage);
    });

    it('should open error dialog', () => {
        const errorMessage = 'Test error';
        service.openErrorDialog(errorMessage);
        expect(service.getErrorMessage()).toBe(errorMessage);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should close error dialog', () => {
        service.closeErrorDialog();
        expect(mockMatDialog.closeAll).toHaveBeenCalled();
    });

    it('should open custom dialog and set values', () => {
        const testMessage = ['Test'];
        const testPoints = 5;
        const testScore = 50;
        const testQuestionPoints = 10;

        service.openCustomDialog(testMessage, RightAnswerPopupComponent, testPoints, testScore, testQuestionPoints);

        expect(service.getAnswerArray()).toEqual(testMessage);
        expect(service.getPointsGained()).toBe(testPoints);
        expect(service.getErrorMessage()).toContain(`${testPoints} points`);
        expect(mockMatDialog.open).toHaveBeenCalledWith(RightAnswerPopupComponent);
    });

    it('should open custom dialog with bonus message when points exceed question points', () => {
        const testMessage = ['Test'];
        const testPoints = 15;
        const testScore = 50;
        const testQuestionPoints = 10;

        service.openCustomDialog(testMessage, RightAnswerPopupComponent, testPoints, testScore, testQuestionPoints);

        expect(service.getErrorMessage()).toContain('bonus');
    });

    it('should set answer array correctly', () => {
        const testArray = ['answer1', 'answer2', 'answer3'];
        service.setAnswerArray(testArray);
        expect(service.getAnswerArray()).toEqual(testArray);
    });

    it('should set points gained correctly', () => {
        const testPoints = 100;
        service.setPointsGained(testPoints);
        expect(service.getPointsGained()).toBe(testPoints);
    });
});
