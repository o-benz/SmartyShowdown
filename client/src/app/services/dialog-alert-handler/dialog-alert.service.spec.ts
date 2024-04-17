import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RightAnswerPopupComponent } from '@app/components/right-answer-popup/right-answer-popup.component';
import { DialogAlertService } from './dialog-alert.service';

describe('DialogAlertService', () => {
    let service: DialogAlertService;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [DialogAlertService, { provide: MatDialog, useValue: mockMatDialog }],
        });
        service = TestBed.inject(DialogAlertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get error message correctly', () => {
        const testMessage = 'Error occurred';
        service.setAlertMessage(testMessage);
        expect(service.getAlertMessage()).toBe(testMessage);
    });

    it('should open error dialog', () => {
        const errorMessage = 'Test error';
        service.openErrorDialog(errorMessage);
        expect(service.getAlertMessage()).toBe(errorMessage);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should open sucess dialog', () => {
        const message = 'Test sucess';
        service.openSuccessDialog(message);
        expect(service.getAlertMessage()).toBe(message);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('should close error dialog', () => {
        service.closeAlertDialog();
        expect(mockMatDialog.closeAll).toHaveBeenCalled();
    });

    it('should open custom dialog and set values', () => {
        const testMessage = ['Test'];
        const testPoints = 5;
        const testScore = 50;
        const testQuestionPoints = 10;

        service.openCustomDialog({
            message: testMessage,
            dialogComponent: RightAnswerPopupComponent,
            points: testPoints,
            score: testScore,
            questionPoints: testQuestionPoints,
        });

        expect(service.getAlertArray()).toEqual(testMessage);
        expect(service.getPointsGained()).toBe(testPoints);
        expect(service.getAlertMessage()).toContain(`${testPoints} points`);
        expect(mockMatDialog.open).toHaveBeenCalledWith(RightAnswerPopupComponent);
    });

    it('should open simple dialog and set values', () => {
        service.openSimpleDialog(RightAnswerPopupComponent);

        expect(mockMatDialog.open).toHaveBeenCalledWith(RightAnswerPopupComponent, { disableClose: true });
    });

    it('should open custom dialog with bonus message when points exceed question points', () => {
        const testMessage = ['Test'];
        const testPoints = 15;
        const testScore = 50;
        const testQuestionPoints = 10;

        service.openCustomDialog({
            message: testMessage,
            dialogComponent: RightAnswerPopupComponent,
            points: testPoints,
            score: testScore,
            questionPoints: testQuestionPoints,
        });

        expect(service.getAlertMessage()).toContain('bonus');
    });

    it('should set answer array correctly', () => {
        const testArray = ['answer1', 'answer2', 'answer3'];
        service.setAnswerArray(testArray);
        expect(service.getAlertArray()).toEqual(testArray);
    });

    it('should set points gained correctly', () => {
        const testPoints = 100;
        service.setPointsGained(testPoints);
        expect(service.getPointsGained()).toBe(testPoints);
    });
});
