import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightAnswerPopupComponent } from './right-answer-popup.component';

describe('RightAnswerPopupComponent', () => {
    let component: RightAnswerPopupComponent;
    let fixture: ComponentFixture<RightAnswerPopupComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RightAnswerPopupComponent],
        });
        fixture = TestBed.createComponent(RightAnswerPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
