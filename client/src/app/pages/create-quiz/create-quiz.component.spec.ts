import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from '@app/components/header/header.component';
import { NewQuestionComponent } from '@app/components/new-question/new-question.component';
import { QuestionModificationComponent } from '@app/components/question-modification/question-modification.component';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
import { CreateQuizComponent } from './create-quiz.component';
import SpyObj = jasmine.SpyObj;

describe('CreateQuizComponent', () => {
    let component: CreateQuizComponent;
    let fixture: ComponentFixture<CreateQuizComponent>;
    let quizServiceSpy: SpyObj<QuizService>;
    let mockDialogAlertService: jasmine.SpyObj<DialogAlertService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuizById', 'addQuiz']);
        mockDialogAlertService = jasmine.createSpyObj('DialogAlertService', ['openErrorDialog']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed'], ['confirm']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);
        TestBed.configureTestingModule({
            declarations: [CreateQuizComponent, HeaderComponent, QuestionModificationComponent, NewQuestionComponent],
            imports: [RouterTestingModule, HttpClientModule, FormsModule],
            providers: [
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DialogAlertService, useValue: mockDialogAlertService },
            ],
        });
        fixture = TestBed.createComponent(CreateQuizComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onSubmit', () => {
        spyOn(component, 'onSubmit');
        component.onSubmit();
        expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should create empty quiz if no id params', () => {
        const route = TestBed.inject(ActivatedRoute);
        route.queryParams = of({ id: null });
        component.ngOnInit();
        expect(component['quizModified']).toEqual({
            id: '',
            visible: true,
            title: '',
            description: '',
            duration: 10,
            lastModification: '',
            questions: [],
        });
    });

    it('should fetch quiz if id params', () => {
        const mockQuiz = {
            id: '1',
            visible: true,
            title: 'title',
            description: 'description',
            duration: 10,
            lastModification: '',
            questions: [],
        };

        const route = TestBed.inject(ActivatedRoute);
        quizServiceSpy.getQuizById.and.returnValue(of(mockQuiz));
        route.queryParams = of({ id: '1' });
        component.ngOnInit();
        expect(quizServiceSpy.getQuizById).toHaveBeenCalled();
        expect(component['quizModified']).toEqual(mockQuiz);
    });

    it('should add quiz if valid', () => {
        quizServiceSpy.addQuiz.and.returnValue(of(true));
        spyOn(component['router'], 'navigate');
        component['quizModified'] = {
            id: '',
            visible: true,
            title: 'title',
            description: 'description',
            duration: 10,
            lastModification: '',
            questions: [],
        };
        component.onSubmit();
        expect(quizServiceSpy.addQuiz).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalled();
    });

    it('should open error dialog if adding is unsucessful', () => {
        quizServiceSpy.addQuiz.and.returnValue(of(false));
        component['quizModified'] = {
            id: '',
            visible: true,
            title: 'title',
            description: 'description',
            duration: 10,
            lastModification: '',
            questions: [],
        };
        component.onSubmit();
        expect(quizServiceSpy.addQuiz).toHaveBeenCalled();
        expect(mockDialogAlertService.openErrorDialog).toHaveBeenCalled();
    });
});
