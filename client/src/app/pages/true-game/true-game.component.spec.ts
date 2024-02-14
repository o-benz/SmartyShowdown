import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerZoneComponent } from '@app/components/answer-zone/answer-zone.component';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { QuestionZoneComponent } from '@app/components/question-zone/question-zone.component';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
import { TrueGameComponent } from './true-game.component';
describe('TrueGameComponent', () => {
    let component: TrueGameComponent;
    let fixture: ComponentFixture<TrueGameComponent>;
    let quizService: QuizService;
    let gameService: GameService;
    let router: Router;
    const durationTest = 60;
    const pointsTest = 10;
    const pointsModifier = 1.2;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TrueGameComponent, AnswerZoneComponent, QuestionZoneComponent, HeaderComponent, ChatBoxComponent],
            imports: [MatDialogModule, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { url: ['test'], paramMap: { get: () => 'test-id' } } } },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    },
                },
                QuizService,
                GameService,
            ],
        });

        fixture = TestBed.createComponent(TrueGameComponent);
        component = fixture.componentInstance;
        quizService = TestBed.inject(QuizService);
        gameService = TestBed.inject(GameService);
        router = TestBed.inject(Router);
        spyOn(quizService, 'getQuizById').and.returnValue(
            of({
                id: 'test-id',
                visible: true,
                title: 'Test Quiz',
                description: 'Test Description',
                duration: 60,
                lastModification: '2024-02-11',
                questions: [
                    {
                        type: 'QCM',
                        text: 'What is 1 + 1?',
                        points: 10,
                        choices: [
                            { text: '1', isCorrect: false },
                            { text: '2', isCorrect: true },
                            { text: '3', isCorrect: false },
                        ],
                    },
                ],
            }),
        );
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with quiz data in test mode', () => {
        expect(component.mode).toEqual('test');
        expect(component.time).toEqual(durationTest);
        expect(component.questions.length).toEqual(1);
    });

    it('should update currentQuestion when advancing to the next question', () => {
        const testQuestions = [
            { type: 'QRL', text: 'Question 1', points: 10 },
            { type: 'QRL', text: 'Question 2', points: 10 },
        ];
        component.questions = testQuestions;
        component.questionIndex = 0;
        component.nextQuestion(false);
        expect(component.currentQuestion).toEqual(testQuestions[1]);
    });

    it('should navigate to create game route when no more questions', () => {
        component.questionIndex = 1;
        component.nextQuestion(false);
        expect(gameService.score).toEqual(0);
        expect(router.navigate).toHaveBeenCalledWith(['/creategame']);
    });

    it('should calculate score correctly in test mode', () => {
        component.currentQuestion = {
            type: 'Multiple Choice',
            text: 'What is 1 + 1?',
            points: 10,
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
                { text: '3', isCorrect: false },
            ],
        };
        component.mode = 'test';
        component.calculateScore(true);
        expect(gameService.score).toEqual(pointsTest * pointsModifier);
    });
});
