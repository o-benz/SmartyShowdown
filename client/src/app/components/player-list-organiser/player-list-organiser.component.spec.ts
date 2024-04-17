import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerState } from '@app/interfaces/game-stats';
import { PLACEHOLDER_PLAYER_STATS } from '@app/services/constants';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { StatService } from '@app/services/stats/stats.service';
import { of } from 'rxjs';
import { PlayerListOrganiserComponent } from './player-list-organiser.component';

describe('PlayerListOrganiserComponent', () => {
    let component: PlayerListOrganiserComponent;
    let fixture: ComponentFixture<PlayerListOrganiserComponent>;
    let statsServiceMock: jasmine.SpyObj<StatService>;
    let socketServiceMock: jasmine.SpyObj<SocketCommunicationService>;

    beforeEach(() => {
        socketServiceMock = {
            mutePlayer: jasmine.createSpy('mutePlayer').and.returnValue(of(null)),
            onPlayerStateChange: jasmine.createSpy('onPlayerStateChange'),
        } as jasmine.SpyObj<SocketCommunicationService>;

        statsServiceMock = {
            sortPlayerByPoints: jasmine.createSpy('sortPlayerByPoints'),
            sortPlayerByState: jasmine.createSpy('sortPlayerByState'),
            sortPlayerByUserName: jasmine.createSpy('sortPlayerByUserName'),
        } as jasmine.SpyObj<StatService>;

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [PlayerListOrganiserComponent],
            providers: [
                { provide: StatService, useValue: statsServiceMock },
                { provide: SocketCommunicationService, useValue: socketServiceMock },
            ],
        });
        fixture = TestBed.createComponent(PlayerListOrganiserComponent);
        component = fixture.componentInstance;
        component.players = PLACEHOLDER_PLAYER_STATS;
        socketServiceMock = TestBed.inject(SocketCommunicationService) as jasmine.SpyObj<SocketCommunicationService>;
        statsServiceMock = TestBed.inject(StatService) as jasmine.SpyObj<StatService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('reverseOrder should reverse the value of isAscending', () => {
        component.players = PLACEHOLDER_PLAYER_STATS;
        component.isAscending = true;
        component.reverseOrder();
        expect(component.isAscending).toBeFalse();
    });

    it('should call sort when component change', () => {
        const spy = spyOn(component, 'sort');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
    });

    it('sort should call correct sorting method', () => {
        component['selectedOption'] = 'name';
        component.sort();
        expect(statsServiceMock.sortPlayerByUserName).toHaveBeenCalled();

        component['selectedOption'] = 'score';
        component.sort();
        expect(statsServiceMock.sortPlayerByUserName).toHaveBeenCalled();

        component['selectedOption'] = 'state';
        component.sort();
        expect(statsServiceMock.sortPlayerByUserName).toHaveBeenCalled();
    });

    it('mutePlayer should call socket service mutePlayer with the username', () => {
        component.players = PLACEHOLDER_PLAYER_STATS;
        component.mutePlayer(PLACEHOLDER_PLAYER_STATS[0].name);
        expect(socketServiceMock.mutePlayer).toHaveBeenCalledWith(PLACEHOLDER_PLAYER_STATS[0].name);
    });

    it('should update player state when server sends new state', () => {
        const newPLayerInfo = PLACEHOLDER_PLAYER_STATS[0];
        newPLayerInfo.state = PlayerState.AnswerConfirmed;
        socketServiceMock.onPlayerStateChange.and.callFake((callback) => callback(newPLayerInfo));
        component.players = PLACEHOLDER_PLAYER_STATS;
        component.ngOnInit();
        spyOn(component, 'ngOnChanges');
        component.players = PLACEHOLDER_PLAYER_STATS;
        expect(component.players[0].state).toBe(PlayerState.AnswerConfirmed);
    });
});
