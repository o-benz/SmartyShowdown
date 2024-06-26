import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseQuestion, Choice } from '@app/interfaces/question-model';
import { GameService } from '@app/services/game/game.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { of } from 'rxjs';
import { AnswerZoneComponent } from './answer-zone.component';
/* eslint-disable max-lines */
describe('AnswerZoneComponent', () => {
    let component: AnswerZoneComponent;
    let fixture: ComponentFixture<AnswerZoneComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketServiceSpy: jasmine.SpyObj<SocketCommunicationService>;

    beforeEach(async () => {
        const gameSpy = jasmine.createSpyObj('GameService', ['postCurrentChoices']);
        let internalIsFinalScore = false;
        Object.defineProperty(gameSpy, 'isFinalScore', {
            get: jasmine.createSpy('getIsFinalScore').and.callFake(() => internalIsFinalScore),
            set: jasmine.createSpy('setIsFinalScore').and.callFake((value) => {
                internalIsFinalScore = value;
            }),
        });
        let internalCurrentChoices: Choice[] = [];
        Object.defineProperty(gameSpy, 'currentChoices', {
            get: jasmine.createSpy('getCurrentChoices').and.callFake(() => internalCurrentChoices),
            set: jasmine.createSpy('setCurrentChoices').and.callFake((value) => {
                internalCurrentChoices = value;
            }),
        });
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', [
            'sendTextAnswer',
            'onFinalizeAnswers',
            'confirmAnswer',
            'addAnswer',
            'getUser',
            'makeUserActive',
        ]);
        await TestBed.configureTestingModule({
            declarations: [AnswerZoneComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GameService, useValue: gameSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
            ],
        }).compileComponents();
        socketServiceSpy.onFinalizeAnswers.and.callFake((callback: () => void) => {
            callback();
        });
        fixture = TestBed.createComponent(AnswerZoneComponent);
        component = fixture.componentInstance;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        gameServiceSpy.postCurrentChoices.and.returnValue(of(true));
        socketServiceSpy.getUser.and.returnValue(of({ score: 100, username: 'bob', answered: false }));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize choices when ngOnChanges is called', () => {
        const mockQuestion: BaseQuestion = {
            type: 'QCM',
            text: 'Sample question',
            points: 10,
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
        };
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.ngOnChanges();
        expect(component.choices).toEqual(mockQuestion.choices || []);
    });

    it('should initialize not choices when ngOnChanges is called without choices', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.ngOnChanges();
        expect(component.choices).toEqual([]);
    });

    it('should initialize currentChoices at [] when ngOnChanges is called when round is over', () => {
        const mockChoice: Choice = { text: 'Sample choice' };
        gameServiceSpy.currentChoices = [mockChoice];
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: true,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.ngOnChanges();
        expect(gameServiceSpy.currentChoices).toEqual([]);
    });

    it('should call onFinalizeAnswers on init and set isChoiceFinal to true', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: true,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.ngOnInit();

        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(gameServiceSpy.isChoiceFinal).toBeTrue();
        expect(socketServiceSpy.confirmAnswer).toHaveBeenCalledWith(mockRoundEndedQuestionPackage.questionIndex);
    });

    it('should call onFinalizeAnswers on init and set isChoiceFinal to true', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: true,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        socketServiceSpy.getUser.and.returnValue(of({ score: 100, username: 'organisateur', answered: false }));
        component.isRandom = true;
        component.ngOnInit();

        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(gameServiceSpy.isChoiceFinal).toBeTrue();
        expect(socketServiceSpy.confirmAnswer).toHaveBeenCalledWith(mockRoundEndedQuestionPackage.questionIndex);
    });

    it('should call onFinalizeAnswers on init and set isChoiceFinal to true and setText', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: true,
            question: {
                type: 'QRL',
                text: 'Sample question',
                points: 10,
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.ngOnInit();

        expect(socketServiceSpy.onFinalizeAnswers).toHaveBeenCalled();
        expect(gameServiceSpy.isChoiceFinal).toBeTrue();
        expect(socketServiceSpy.sendTextAnswer).toHaveBeenCalled();
        expect(socketServiceSpy.confirmAnswer).toHaveBeenCalledWith(mockRoundEndedQuestionPackage.questionIndex);
    });

    it('should lock answer and emit qcmFinishedEvent when lockAnswer is called', () => {
        const mockQuestion: BaseQuestion = {
            type: 'QCM',
            text: 'Sample question',
            points: 10,
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
        };
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: 'test',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.textAnswer = '';
        component['gameService'].currentChoices = [{ text: 'Sample choice' }];

        spyOn(component.qcmFinishedEvent, 'emit');

        component.lockAnswer();

        expect(gameServiceSpy.postCurrentChoices).toHaveBeenCalledOnceWith(mockQuestion.text);
        expect(component.qcmFinishedEvent.emit).toHaveBeenCalledOnceWith(true);
    });

    it('should not lock answer and emit qcmFinishedEvent when lockAnswer is called whith invalid data', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: 'test',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.textAnswer = '';
        component['gameService'].currentChoices = [];

        spyOn(component.qcmFinishedEvent, 'emit');

        component.lockAnswer();

        expect(component.qcmFinishedEvent.emit).not.toHaveBeenCalled();
    });

    it('should lock answer and confirmAnswer and sendText when lockAnswer is called in QRL', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QRL',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.textAnswer = '';
        component['gameService'].currentChoices = [{ text: 'Sample choice' }];

        component.lockAnswer();

        expect(gameServiceSpy.isChoiceFinal).toBeTrue();
        expect(socketServiceSpy.sendTextAnswer).toHaveBeenCalled();
        expect(socketServiceSpy.confirmAnswer).toHaveBeenCalledWith(mockRoundEndedQuestionPackage.questionIndex);
    });

    it('should lock answer and emit qcmFinishedEvent when lockAnswer is called with textAnswer', () => {
        const mockQuestion: BaseQuestion = {
            type: 'QCM',
            text: 'Sample question',
            points: 10,
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
        };
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: 'test',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        component.textAnswer = ' ALLO';

        spyOn(component.qcmFinishedEvent, 'emit');

        component.lockAnswer();

        expect(gameServiceSpy.postCurrentChoices).toHaveBeenCalledOnceWith(mockQuestion.text);
        expect(component.qcmFinishedEvent.emit).toHaveBeenCalledOnceWith(true);
    });

    it('should add or remove choice in currentChoices when chooseChoice is called', () => {
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const mockChoice: Choice = { text: 'Sample choice' };
        component.choices = [mockChoice];
        component.chooseChoice(0);
        expect(gameServiceSpy.currentChoices).toEqual([mockChoice]);
        component.chooseChoice(0);
        expect(gameServiceSpy.currentChoices).toEqual([]);
    });

    it('should unsubscribe from gameSubscription when ngOnDestroy is called', () => {
        component['gameSubscription'] = {
            unsubscribe: jasmine.createSpy('unsubscribe'),
        } as any;  // eslint-disable-line
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
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);

        expect(component.lockAnswer).toHaveBeenCalled();
    });

    it('should call chooseChoice with index 0 when 1 key is pressed', () => {
        spyOn(component, 'chooseChoice');
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(0);
    });

    it('should call chooseChoice with index 1 when 2 key is pressed', () => {
        spyOn(component, 'chooseChoice');
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: '2' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(1);
    });

    it('should call chooseChoice with index 2 when 3 key is pressed', () => {
        spyOn(component, 'chooseChoice');
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: '3' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(2);
    });

    it('should call chooseChoice with index 3 when 4 key is pressed', () => {
        spyOn(component, 'chooseChoice');
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QCM',
                text: 'Sample question',
                points: 10,
                choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }],
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: '4' });
        component.buttonDetect(event);

        expect(component.chooseChoice).toHaveBeenCalledWith(3);
    });

    it('should make user active if pressing a key when QRL', () => {
        spyOn(component, 'chooseChoice');
        const mockRoundEndedQuestionPackage = {
            isRoundEnded: false,
            question: {
                type: 'QRL',
                text: 'Sample question',
                points: 10,
            },
            questionIndex: 1,
            mode: '',
        };
        component.roundEndedQuestionPackage = mockRoundEndedQuestionPackage;
        const event = new KeyboardEvent('keydown', { key: 'g' });
        component.buttonDetect(event);

        expect(socketServiceSpy.makeUserActive).toHaveBeenCalled();
    });
});
