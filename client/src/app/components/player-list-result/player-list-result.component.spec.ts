import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerListResultComponent } from './player-list-result.component';

describe('PlayerListResultComponent', () => {
    let component: PlayerListResultComponent;
    let fixture: ComponentFixture<PlayerListResultComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListResultComponent],
        });
        fixture = TestBed.createComponent(PlayerListResultComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
