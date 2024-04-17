import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '@app/components/header/header.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { TrueGameComponent } from '@app/pages/true-game/true-game.component';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
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
    let errorDialogSpy: SpyObj<DialogAlertService>;

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
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getAllQuiz', 'getQuizById', 'generateRandomQuiz']);
        quizServiceSpy.getAllQuiz.and.returnValue(of([mockQuiz]));
        errorDialogSpy = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketCommunicationService', ['createRoom', 'createRandomRoom', 'connect']);
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
                { provide: DialogAlertService, useValue: errorDialogSpy },
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

    it('should check if the quiz is available and navigate to test if it is', fakeAsync(() => {
        mockQuiz.visible = true;
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj;
        component.validateBeforeClosing();
        tick();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/test', '1']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('if quiz not available should open error dialog', fakeAsync(() => {
        mockQuiz.visible = false;
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj;
        component.validateBeforeClosing();
        tick();
        expect(errorDialogSpy.openErrorDialog).toHaveBeenCalled();
    }));

    it('should store the room code, navigate to lobby, and close the dialog', fakeAsync(() => {
        component.dialogRef = dialogRefSpyObj;
        component.selectedQuiz = mockQuiz;
        component.createGameRoom();
        tick();

        expect(socketServiceSpy.createRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/lobby']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('should open the dialog when selectedQuiz title is not "Mode Aléatoire"', fakeAsync(() => {
        const nonRandomQuiz: Quiz = { ...mockQuiz, title: 'Test Quiz' };
        component.openDialog(nonRandomQuiz);
        tick();
        expect(dialogSpy.open).toHaveBeenCalled();
    }));

    it('should open the dialog when selectedQuiz title is "Mode Aléatoire"', fakeAsync(() => {
        const randomQuiz: Quiz = { ...mockQuiz, title: 'Mode Aléatoire' };
        component.openDialog(randomQuiz);
        tick();
        expect(dialogSpy.open).toHaveBeenCalled();
    }));

    it('should navigate to test if quiz is available and close dialog', fakeAsync(() => {
        mockQuiz.visible = true;
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj;
        component.validateBeforeClosing();
        tick();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/test', '1']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('should open error dialog if quiz is not available', fakeAsync(() => {
        mockQuiz.visible = false;
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj;
        component.validateBeforeClosing();
        tick();
        expect(errorDialogSpy.openErrorDialog).toHaveBeenCalled();
    }));

    it('should create a room and navigate to lobby when isRandom is false', fakeAsync(() => {
        component.isRandom = false;
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj; // Ensure dialogRef is defined
        socketServiceSpy.createRoom.and.returnValue(of('12345')); // Ensure createRoom returns an Observable
        component.createGameRoom();
        tick();
        expect(socketServiceSpy.createRoom).toHaveBeenCalledWith('1');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/lobby']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));

    it('should create a random room and navigate to lobby when isRandom is true', fakeAsync(() => {
        component.isRandom = true;
        component.selectedQuiz = mockQuiz;
        component.dialogRef = dialogRefSpyObj;
        socketServiceSpy.createRandomRoom.and.returnValue(of('12345'));
        component.createGameRoom();
        tick();
        expect(socketServiceSpy.createRandomRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/lobby']);
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));
});
