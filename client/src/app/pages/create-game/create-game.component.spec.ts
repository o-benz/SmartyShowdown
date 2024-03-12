import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '@app/components/header/header.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { TrueGameComponent } from '@app/pages/true-game/true-game.component';
import { QuizService } from '@app/services/quiz/quiz.service';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';
import { of } from 'rxjs';
import { CreateGameComponent } from './create-game.component';
import SpyObj = jasmine.SpyObj;

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let dialogSpy: SpyObj<MatDialog>;
    let mockButton: HTMLButtonElement;
    const dialogRefSpyObj = jasmine.createSpyObj({ close: null });
    let quizServiceSpy: SpyObj<QuizService>;
    let routerSpy: SpyObj<Router>;
    let socketServiceSpy: SpyObj<SocketCommunicationService>;

    const mockQuiz: Quiz = {
        id: '1',
        visible: true,
        title: 'test Quiz',
        description: 'test quiz',
        duration: 60,
        lastModification: '',
        questions: [],
    };

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'close']);
        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getAllQuiz', 'getQuizById']);
        quizServiceSpy.getAllQuiz.and.returnValue(of([mockQuiz]));

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['createRoom', 'connect']);
        // Simulate the room creation by returning a room code
        socketServiceSpy.createRoom.and.returnValue(of('12345'));

        await TestBed.configureTestingModule({
            declarations: [CreateGameComponent, HeaderComponent],
            imports: [
                HttpClientModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'game/test/:id', component: TrueGameComponent }]),
            ],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketCommunicationService, useValue: socketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Clicking on a card should open the dialog', fakeAsync(() => {
        mockButton = document.createElement('button');
        mockButton.className = 'listeGamesVisibleBtn';
        fixture.nativeElement.appendChild(mockButton);
        fixture.detectChanges();

        mockButton.addEventListener('click', () => component.openDialog(mockQuiz));
        mockButton.click();
        tick();
        expect(dialogSpy.open).toHaveBeenCalled();
    }));

    it('Clicking close should close the dialog', fakeAsync(() => {
        component.openDialog(mockQuiz);
        tick();
        fixture.detectChanges();

        mockButton = document.createElement('button');
        mockButton.id = 'closeBtn';
        fixture.nativeElement.appendChild(mockButton);
        fixture.detectChanges();
        mockButton.addEventListener('click', () => component.closeDialog());
        mockButton.click();

        tick();
        fixture.detectChanges();

        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('should check if the quiz is available', fakeAsync(() => {
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;

        component.dialogRef = dialogRefSpyObj;

        component.validateBeforeClosing();
        tick();
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('should store the room code, navigate to lobby, and close the dialog', fakeAsync(() => {
        component.dialogRef = dialogRefSpyObj; // Ensure dialogRef is set before calling createGameRoom
        component.selectedQuiz = mockQuiz;
        component.createGameRoom();
        tick();

        expect(socketServiceSpy.createRoom).toHaveBeenCalled();
        expect(localStorage.getItem('roomCode')).toBe('12345');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/lobby']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));
});
