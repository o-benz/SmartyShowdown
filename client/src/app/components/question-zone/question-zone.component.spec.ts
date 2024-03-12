/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { TimeService } from '@app/services/time/time.service';
import { QuestionZoneComponent } from './question-zone.component';
describe('QuestionZoneComponent', () => {
    let component: QuestionZoneComponent;
    let fixture: ComponentFixture<QuestionZoneComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const timeSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        const gameSpy = jasmine.createSpyObj('GameService', ['postCurrentChoices']);

        await TestBed.configureTestingModule({
            declarations: [QuestionZoneComponent],
            providers: [
                { provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: TimeService, useValue: timeSpy },
                { provide: GameService, useValue: gameSpy },
            ],
        }).compileComponents();

        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(QuestionZoneComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start timer when ngOnChanges is called', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false };
        component.questionTimePackage = questionPackage;

        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();

        expect(component.startTimer).toHaveBeenCalled();
        expect(component.duration).toEqual(questionPackage.time);
    });

    it('should only change score when ngOnChanges is called when the round is ended', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: true };
        component.questionTimePackage = questionPackage;
        spyOn(component, 'startTimer').and.callThrough();

        component.ngOnChanges();
        expect(component.score).toBe(gameServiceSpy.score);
        expect(component.startTimer).not.toHaveBeenCalled();
    });

    it('should set component properties when ngOnChanges is called with valid question package', () => {
        const questionPackage = { time: 10, question: { text: 'Question', points: 10, type: 'Type' }, isTimeOver: false };
        component.questionTimePackage = questionPackage;

        component.ngOnChanges();

        expect(component.text).toEqual(questionPackage.question.text);
        expect(component.duration).toEqual(questionPackage.time);
        expect(component.points).toEqual(questionPackage.question.points);
    });
    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.navigateHome();
        expect(spy).toHaveBeenCalledWith(['/home']);
    });
});
