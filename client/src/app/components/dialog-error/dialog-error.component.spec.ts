import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogErrorComponent } from './dialog-error.component';

describe('DialogErrorComponent', () => {
    let component: DialogErrorComponent;
    let fixture: ComponentFixture<DialogErrorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogErrorComponent],
            providers: [MatDialog],
            imports: [MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
