import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogErrorComponent } from '@app/components/dialog-error/dialog-error.component';

import { DialogErrorService } from './dialog-error.service';

describe('DialogErrorService', () => {
    let service: DialogErrorService;
    let dialog: MatDialog;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [DialogErrorService],
        });
        service = TestBed.inject(DialogErrorService);
        dialog = TestBed.inject(MatDialog);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get error message correctly', () => {
        const testErrorMessage = 'Test Error Message';
        service.errorMessage = testErrorMessage;
        expect(service.errorMessage).toBe(testErrorMessage);
    });

    it('should open the error dialog with the correct message', () => {
        const spy = spyOn(dialog, 'open');
        const testErrorMessage = 'Another Test Error Message';
        service.openErrorDialog(testErrorMessage);

        expect(spy).toHaveBeenCalledOnceWith(DialogErrorComponent);
        expect(service.errorMessage).toBe(testErrorMessage);
    });
});
