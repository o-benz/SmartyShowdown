import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsZoneComponent } from './stats-zone.component';

describe('StatsZoneComponent', () => {
    let component: StatsZoneComponent;
    let fixture: ComponentFixture<StatsZoneComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatsZoneComponent],
        });
        fixture = TestBed.createComponent(StatsZoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
