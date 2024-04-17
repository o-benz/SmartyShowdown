import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerListResultComponent } from '@app/components/player-list-result/player-list-result.component';
import { QuestionStatsComponent } from '@app/components/question-stats/question-stats.component';
import { PLACEHOLDER_GAME_STATS, PLACEHOLDER_PLAYER_STATS } from '@app/services/constants';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { StatService } from '@app/services/stats/stats.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { of } from 'rxjs';
import { ResultPageComponent } from './result-page.component';

@Component({ standalone: true, selector: 'app-chat-box', template: '' })
class ChatStubComponent {}

describe('ResultPageComponent', () => {
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;
    let statServiceSpy: jasmine.SpyObj<StatService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultPageComponent, PlayerListResultComponent, QuestionStatsComponent, HeaderComponent],
            providers: [
                { provide: SocketCommunicationService, useValue: jasmine.createSpyObj('SocketCommunicationService', ['getStats']) },
                { provide: StatService, useValue: jasmine.createSpyObj('StatService', ['sortPlayerByPoints']) },
                { provide: GameService, useValue: jasmine.createSpyObj('GameService', ['staysInInterval']) },
            ],
            imports: [CanvasJSAngularChartsModule, ChatStubComponent, FormsModule],
        });
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        gameServiceSpy.staysInInterval.and.returnValue(true);
        socketServiceSpy = TestBed.inject(SocketCommunicationService) as jasmine.SpyObj<SocketCommunicationService>;
        socketServiceSpy.getStats.and.returnValues(of(PLACEHOLDER_GAME_STATS));
        statServiceSpy = TestBed.inject(StatService) as jasmine.SpyObj<StatService>;
        statServiceSpy.sortPlayerByPoints.and.returnValue(PLACEHOLDER_PLAYER_STATS);
        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getStats and update the objects params when the subject sends them', async () => {
        socketServiceSpy.getStats.and.returnValues(of(PLACEHOLDER_GAME_STATS));
        component.ngOnInit();
        expect(component['gameStats']).toEqual(PLACEHOLDER_GAME_STATS);
    });

    it('should change diagram to next question when direction is positive', () => {
        component['gameStats'] = PLACEHOLDER_GAME_STATS;
        component['questionIndex'] = 0;
        component['selectedQuestion'].subscribe((question) => {
            expect(question.title).toEqual('question 2');
        });
        component.changeDiagram(1);
    });
});
