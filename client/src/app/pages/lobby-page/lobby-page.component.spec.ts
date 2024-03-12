import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { WaitingRoomListComponent } from '@app/components/waiting-room-list/waiting-room-list.component';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyPageComponent, ChatBoxComponent, HeaderComponent, WaitingRoomListComponent],
            providers: [{ provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }],
            imports: [RouterTestingModule],
        });
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        TestBed.inject(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
