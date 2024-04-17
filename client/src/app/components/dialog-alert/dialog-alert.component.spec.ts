import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogAlertComponent } from './dialog-alert.component';

describe('DialogAlertComponent', () => {
    let component: DialogAlertComponent;
    let fixture: ComponentFixture<DialogAlertComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogAlertComponent],
            providers: [MatDialog],
            imports: [MatDialogModule],
        });
        fixture = TestBed.createComponent(DialogAlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
