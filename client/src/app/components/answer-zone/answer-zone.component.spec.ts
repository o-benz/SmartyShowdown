/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Choice, Question } from '@app/interfaces/quiz-model';
import { GameService } from '@app/services/game/game.service';
import { of } from 'rxjs';
import { AnswerZoneComponent } from './answer-zone.component';

describe('AnswerZoneComponent', () => {
    let component: AnswerZoneComponent;
    let fixture: ComponentFixture<AnswerZoneComponent>;
    let gameService: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AnswerZoneComponent],
            imports: [HttpClientTestingModule],
            providers: [GameService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AnswerZoneComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize choices when ngOnChanges is called', () => {
        const mockQuestion: Question = {
            type: 'QCM',
            text: 'Sample question',
            points: 10,
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
        };
        component.currentQuestion = mockQuestion;
        component.ngOnChanges();
        expect(component.choices).toEqual(mockQuestion.choices || []);
    });

    it('should lock answer and emit qcmFinishedEvent when lockAnswer is called', () => {
        const mockQuestion: Question = {
            type: 'QCM',
            text: 'Sample question',
            points: 10,
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
        };
        component.currentQuestion = mockQuestion;
        component.textAnswer = '';
        component['gameService'].currentChoices = [{ text: 'Sample choice' }];

        spyOn(gameService, 'postCurrentChoices').and.returnValue(of(true));
        spyOn(component.qcmFinishedEvent, 'emit');

        component.lockAnswer();

        expect(component.isAnswerLocked).toBeTrue();
        expect(gameService.postCurrentChoices).toHaveBeenCalledOnceWith(mockQuestion);
        expect(component.qcmFinishedEvent.emit).toHaveBeenCalledOnceWith(true);
    });

    it('should emit qrlFinishedEvent when nextQuestion is called with type QRL', () => {
        spyOn(component.qrlFinishedEvent, 'emit');
        component.currentQuestion = { type: 'QRL', text: 'Sample QRL question', points: 5 };
        component.nextQuestion();
        expect(component.qrlFinishedEvent.emit).toHaveBeenCalledOnceWith(true);
    });

    it('should add or remove choice in currentChoices when chooseChoice is called', () => {
        const mockChoice: Choice = { text: 'Sample choice' };
        component.choices = [mockChoice];
        component.chooseChoice(0);
        expect(gameService.currentChoices).toEqual([mockChoice]);
        component.chooseChoice(0);
        expect(gameService.currentChoices).toEqual([]);
    });

    it('should unsubscribe from gameSubscription when ngOnDestroy is called', () => {
        component['gameSubscription'] = {
            unsubscribe: jasmine.createSpy('unsubscribe'),
        } as any;
        component.ngOnDestroy();
        expect(component['gameSubscription']?.unsubscribe).toHaveBeenCalled();
    });

    it('should return true if the choice is selected', () => {
        const mockChoice: Choice = { text: 'Sample choice' };
        component['gameService'].currentChoices = [mockChoice];

        const isSelected = component.isChoiceSelected(mockChoice);

        expect(isSelected).toBeTrue();
    });

    it('should call lockAnswer when Enter key is pressed', () => {
        spyOn(component, 'lockAnswer');

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);

        expect(component.lockAnswer).toHaveBeenCalled();
    });

    it('should call chooseChoice with index 0 when 1 key is pressed', () => {
        spyOn(component, 'chooseChoice');

        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(0);
    });

    it('should call chooseChoice with index 1 when 2 key is pressed', () => {
        spyOn(component, 'chooseChoice');

        const event = new KeyboardEvent('keydown', { key: '2' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(1);
    });

    it('should call chooseChoice with index 2 when 3 key is pressed', () => {
        spyOn(component, 'chooseChoice');

        const event = new KeyboardEvent('keydown', { key: '3' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(2);
    });

    it('should call chooseChoice with index 3 when 4 key is pressed', () => {
        spyOn(component, 'chooseChoice');

        const event = new KeyboardEvent('keydown', { key: '4' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(3);
    });
});
