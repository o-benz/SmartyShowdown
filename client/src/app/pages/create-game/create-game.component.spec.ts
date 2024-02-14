import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import { HeaderComponent } from '@app/components/header/header.component';
import { TrueGameComponent } from '@app/pages/true-game/true-game.component';
import { CreateGameComponent } from './create-game.component';
import SpyObj = jasmine.SpyObj;

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let dialogSpy: SpyObj<MatDialog>;
    let mockButton: HTMLButtonElement;
    const dialogRefSpyObj = jasmine.createSpyObj({ close: null });
    let quizService: QuizService;

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

        await TestBed.configureTestingModule({
            declarations: [CreateGameComponent, HeaderComponent],
            imports: [
                HttpClientModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'game/test/:id', component: TrueGameComponent }]),
            ],
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        quizService = TestBed.inject(QuizService);
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
        spyOn(quizService, 'getQuizById').and.returnValue(of(mockQuiz));
        component.selectedQuiz = mockQuiz;

        component.dialogRef = dialogRefSpyObj;

        component.validateBeforeClosing();
        tick();
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    }));
});
