import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { DialogErrorService } from './dialog-error.service';

describe('DialogErrorService', () => {
    let service: DialogErrorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [DialogErrorService],
        });
        service = TestBed.inject(DialogErrorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
