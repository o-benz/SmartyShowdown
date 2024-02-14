import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImportErrorComponent } from '@app/components/import-quiz/import-error/import-error/import-error.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { games } from '@app/interfaces/quiz';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizImportService } from '@app/services/quiz-import/quiz-import.service';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { JsonQuizCheckService } from './json-quiz-check.service';

describe('JsonQuizCheckService', () => {
    let service: JsonQuizCheckService;
    let importSpy: jasmine.SpyObj<QuizImportService>;
    let checkSpy: jasmine.SpyObj<QuizValueCheckService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let importErrorSpy: jasmine.SpyObj<ImportErrorComponent>;

    beforeEach(() => {
        const spyMatDialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule],
            providers: [
                { provide: importSpy, useValue: jasmine.createSpyObj('QuizImportService', ['readFileAsQuiz', 'readFileContent']) },
                { provide: checkSpy, useValue: jasmine.createSpyObj('QuizValueCheckService', ['getSanitizedQuiz', 'checkQuiz', 'getResult']) },
                { provide: dialogSpy, useValue: spyMatDialog },
                { provide: quizServiceSpy, useValue: jasmine.createSpyObj('QuizService', ['addQuiz', 'getAllQuiz']) },
                { provide: importErrorSpy, useValue: jasmine.createSpyObj('ImportErrorComponent', ['prepareNameCheck']) },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        importSpy = TestBed.inject(QuizImportService) as jasmine.SpyObj<QuizImportService>;
        checkSpy = TestBed.inject(QuizValueCheckService) as jasmine.SpyObj<QuizValueCheckService>;
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        service = TestBed.inject(JsonQuizCheckService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('verifyInput should call handle error when verification or import fails', async () => {
        const fileContent = JSON.stringify(games[0]);
        const file = new File([fileContent], 'testQuiz.json', { type: 'application/json' });
        const readSpy = spyOn(importSpy, 'readFileAsQuiz').and.rejectWith(Error('error'));
        const errSpy = spyOn(service, 'handleErrorMessage');
        await service.verifyInput(file);

        readSpy.and.resolveTo(games[0]);
        spyOn(checkSpy, 'getResult').and.returnValue(false);

        await service.verifyInput(file);

        expect(errSpy).toHaveBeenCalledTimes(2);
    });

    it('verifyInput should call nameCheck if all test are true', async () => {
        const fileContent = JSON.stringify(games[0]);
        const file = new File([fileContent], 'testQuiz.json', { type: 'application/json' });
        spyOn(importSpy, 'readFileAsQuiz').and.resolveTo(games[0]);
        const nameSpy = spyOn(service, 'nameCheck');
        spyOn(checkSpy, 'getResult').and.returnValue(true);
        spyOn(checkSpy, 'getSanitizedQuiz').and.returnValue(games[0]);

        await service.verifyInput(file);

        expect(nameSpy).toHaveBeenCalled();
    });

    it('nameCheck should open import-error and call addToQuizList with new name', () => {
        const mockQuiz: Quiz = { id: '000004', title: 'first', questions: [] } as unknown as Quiz;
        QuizListComponent.quizzes = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];
        const errorComponent = service.handleErrorMessage('error');
        spyOn(dialogSpy, 'open').and.returnValue(errorComponent);
        const spyAdd = spyOn(service, 'addToQuizList');
        spyOn(errorComponent, 'afterClosed').and.returnValue(of({ id: '000004', title: 'quizNewName', questions: [] }));
        service.nameCheck(mockQuiz);
        errorComponent.close();
        expect(spyAdd).toHaveBeenCalledWith({ id: '000004', title: 'quizNewName', questions: [] } as unknown as Quiz);
    });

    it('nameCheck should call addToQuizList if there is no name duplication', () => {
        const mockQuiz: Quiz = { id: '000004', title: 'Mock Quiz', questions: [] } as unknown as Quiz;
        QuizListComponent.quizzes = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];
        const spy = spyOn(service, 'addToQuizList');
        service.nameCheck(mockQuiz);
        expect(spy).toHaveBeenCalledWith(mockQuiz);
    });

    it('should open a mat dialog if an error is encountered', () => {
        const spy = spyOn(dialogSpy, 'open').and.returnValue({ componentInstance: { message: '' } } as MatDialogRef<unknown>);
        service.handleErrorMessage('error');
        expect(spy).toHaveBeenCalledWith(ImportErrorComponent);
    });

    it('should call errorHandler when errors while adding quiz to database', () => {
        const errSpy = spyOn(service, 'handleErrorMessage');
        const mockQuiz: Quiz = {} as unknown as Quiz;
        const addSpy = spyOn(quizServiceSpy, 'addQuiz').and.returnValue(throwError(() => new Error()));

        service.addToQuizList(mockQuiz);

        expect(addSpy).toHaveBeenCalledWith(mockQuiz);
        expect(errSpy).toHaveBeenCalled();
    });

    it('should refresh location when quiz is added successfully', () => {
        const mockQuiz: Quiz = { id: 'mockId', title: 'Mock Quiz', questions: [] } as unknown as Quiz;
        const addSpy = spyOn(quizServiceSpy, 'addQuiz').and.returnValue(of(true));
        const reloadSpy = spyOn<any>(service, 'stealthPageReload'); //eslint-disable-line

        service.addToQuizList(mockQuiz);

        expect(addSpy).toHaveBeenCalledWith(mockQuiz);
        expect(reloadSpy).toHaveBeenCalled();
    });
});
