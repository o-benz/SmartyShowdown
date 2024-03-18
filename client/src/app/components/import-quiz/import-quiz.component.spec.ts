import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuizImportService } from '@app/services/quiz-import/quiz-import.service';
import { ImportQuizComponent } from './import-quiz.component';

describe('ImportQuizComponent', () => {
    let component: ImportQuizComponent;
    let fixture: ComponentFixture<ImportQuizComponent>;
    let mockQuizService: jasmine.SpyObj<QuizImportService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ImportQuizComponent],
            providers: [
                { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
                { provide: QuizImportService, useValue: jasmine.createSpyObj('JsonQuizCheckService', ['importQuiz']) },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['']) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportQuizComponent);
        component = fixture.componentInstance;
        TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        mockQuizService = TestBed.inject(QuizImportService) as jasmine.SpyObj<QuizImportService>;
        TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call verifyInput method of JsonQuizCheckService when onFileChange is called', () => {
        const file = new File([''], 'test.json', { type: 'application/json' });
        const event = {
            target: {
                files: [file],
            },
        } as unknown as Event;

        component.onFileChange(event);

        expect(mockQuizService.importQuiz).toHaveBeenCalledWith(file);
    });
});
