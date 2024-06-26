import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ImportErrorComponent } from '@app/components/import-error/import-error.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
import { JsonQuizCheckService } from './json-quiz-check.service';

describe('JsonQuizCheckService', () => {
    let service: JsonQuizCheckService;
    let checkSpy: jasmine.SpyObj<QuizValueCheckService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let importErrorSpy: jasmine.SpyObj<ImportErrorComponent>;
    let fileReaderSpy: jasmine.SpyObj<FileReader>;

    beforeEach(() => {
        const spyMatDialog = jasmine.createSpyObj('MatDialog', ['afterClosed', 'open']);

        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    {
                        path: 'admin',
                        pathMatch: 'full',
                        component: ImportErrorComponent,
                    },
                ]),
            ],
            providers: [
                { provide: checkSpy, useValue: jasmine.createSpyObj('QuizValueCheckService', ['checkQuiz', 'getResult', 'isValidQuiz']) },
                { provide: dialogSpy, useValue: spyMatDialog },
                { provide: quizServiceSpy, useValue: jasmine.createSpyObj('QuizService', ['addQuiz', 'getAllQuiz']) },
                { provide: importErrorSpy, useValue: jasmine.createSpyObj('ImportErrorComponent', ['prepareNameCheck']) },
                { provide: fileReaderSpy, useValue: jasmine.createSpyObj('FileReader', ['readAsText']) },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        checkSpy = TestBed.inject(QuizValueCheckService) as jasmine.SpyObj<QuizValueCheckService>;
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        service = TestBed.inject(JsonQuizCheckService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('nameCheck should reject if no new name is given', (done) => {
        const mockQuiz: Quiz = { id: '000004', title: 'first', questions: [] } as unknown as Quiz;
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        mockDialogRef.componentInstance = { prepareNameCheck: jasmine.createSpy(), message: '' };
        mockDialogRef.afterClosed.and.returnValue(of(null));

        spyOn(dialogSpy, 'open').and.returnValue(mockDialogRef);

        service.nameCheck(mockQuiz).catch((error): void => {
            expect(error.message).toEqual("Un nouveau nom n'a pas été sélectionné");
            done();
        });
    });

    it('nameCheck should resolve with new name if new name is provided', (done) => {
        const mockQuiz: Quiz = { id: '000004', title: 'first', questions: [] } as unknown as Quiz;
        service['quizzes'] = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];
        const errorComponent = service['handleErrorMessage']('error');
        spyOn(dialogSpy, 'open').and.returnValue(errorComponent);
        service
            .nameCheck(mockQuiz)
            .then((quizNewName) => {
                expect(quizNewName).toEqual('newName');
                done();
            })
            .catch((error) => {
                expect(error).toEqual("Un nouveau nom n'a pas été sélectionné");
                done();
            });
        errorComponent.close('newName' as unknown as Quiz);
    });

    it('should open a mat dialog if an error is encountered', () => {
        const spy = spyOn(dialogSpy, 'open').and.returnValue({ componentInstance: { message: '' } } as MatDialogRef<unknown>);
        service['handleErrorMessage']('error');
        expect(spy).toHaveBeenCalledWith(ImportErrorComponent, { width: '50%' });
    });

    it('isNameAvailable return true if no other quiz in quizList have this name', () => {
        const quizNewName: Quiz = { id: '000004', title: 'forth', questions: [] } as unknown as Quiz;
        service['quizzes'] = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];

        const newQuiz = service['isNameAvailable'](quizNewName);
        expect(newQuiz).toBeTrue();
        const alreadyTakenName = service['isNameAvailable'](service['quizzes'][0]);
        expect(alreadyTakenName).toBeFalse();
    });
});
