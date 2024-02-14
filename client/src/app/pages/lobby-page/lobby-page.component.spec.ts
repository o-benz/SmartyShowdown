import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyPageComponent, ChatBoxComponent, HeaderComponent],
            imports: [RouterTestingModule],
        });
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(router, 'navigate');
        component.startGame();
        expect(spy).toHaveBeenCalledWith(['/game/play']);
    });
});
