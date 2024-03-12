import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ImportErrorComponent } from '@app/components/import-error/import-error.component';
import { QuizListComponent } from '@app/components/quiz-list/quiz-list.component';
import { games } from '@app/interfaces/quiz';
import { Quiz } from '@app/interfaces/quiz-model';
import { QuizValueCheckService } from '@app/services/quiz-value-check/quiz-value-check.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { JsonQuizCheckService } from './json-quiz-check.service';

describe('JsonQuizCheckService', () => {
    let service: JsonQuizCheckService;
    let checkSpy: jasmine.SpyObj<QuizValueCheckService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let importErrorSpy: jasmine.SpyObj<ImportErrorComponent>;
    let fileReaderSpy: jasmine.SpyObj<FileReader>;
    let router: Router;

    beforeEach(() => {
        const spyMatDialog = jasmine.createSpyObj('MatDialog', ['']);

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
        router = TestBed.inject(Router);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('readQuizFromFile should return a quiz when import is sucessful', async () => {
        const file = new File([JSON.stringify(games[0])], 'testQuiz.json', { type: 'application/json' });
        const result = service['readQuizFromFile'](file);
        await expectAsync(result).toBeResolvedTo(games[0]);
    });

    it('readQuizFromFile should call handleError when file is empty', async () => {
        const file = new File([], 'testQuiz.json', { type: 'application/json' });
        const spy = spyOn<any>(service, 'handleErrorMessage'); // eslint-disable-line
        await service['readQuizFromFile'](file);
        expect(spy).toHaveBeenCalled();
    });

    it('readQuizFromFile should call handleError when file is not json', async () => {
        const file = new File(['texte'], 'testQuiz.txt', { type: 'txt' });
        const spy = spyOn<any>(service, 'handleErrorMessage'); // eslint-disable-line
        await service['readQuizFromFile'](file);
        expect(spy).toHaveBeenCalled();
    });

    it('importQuiz should call handle error with checker message when tests fails', async () => {
        const file = new File([JSON.stringify(games[0])], 'testQuiz.json', { type: 'application/json' });
        const errSpy = spyOn<any>(service, 'handleErrorMessage'); // eslint-disable-line
        spyOn(checkSpy, 'isValidQuiz').and.returnValue(false);
        spyOn(checkSpy, 'getMessage').and.returnValue('message');

        await service.importQuiz(file);

        expect(errSpy).toHaveBeenCalledWith('message');
    });

    it('importQuiz should call nameCheck if a quiz with this name already exists', async () => {
        const file = new File([JSON.stringify(games[0])], 'testQuiz.json', { type: 'application/json' });
        const nameSpy = spyOn<any>(service, 'nameCheck'); // eslint-disable-line
        spyOn(checkSpy, 'isValidQuiz').and.returnValue(true);
        spyOn<any>(service, 'isNameAvailable').and.returnValue(false); // eslint-disable-line
        spyOnProperty(checkSpy, 'sanitizedQuiz').and.returnValue(games[0]);

        await service.importQuiz(file);

        expect(nameSpy).toHaveBeenCalled();
    });

    it('importQuiz should call nameCheck if a quiz with this name already exists', async () => {
        const file = new File([JSON.stringify(games[0])], 'testQuiz.json', { type: 'application/json' });
        const nameSpy = spyOn<any>(service, 'nameCheck'); // eslint-disable-line
        spyOn(checkSpy, 'isValidQuiz').and.returnValue(true);
        spyOn<any>(service, 'isNameAvailable').and.returnValue(false); // eslint-disable-line
        spyOnProperty(checkSpy, 'sanitizedQuiz').and.returnValue(games[0]);

        await service.importQuiz(file);

        expect(nameSpy).toHaveBeenCalled();
    });

    it('importQuiz should call addToQuizList if a quiz passes all tests', async () => {
        const file = new File([JSON.stringify(games[0])], 'testQuiz.json', { type: 'application/json' });
        const nameSpy = spyOn<any>(service, 'addToQuizList'); // eslint-disable-line
        spyOn(checkSpy, 'isValidQuiz').and.returnValue(true);
        spyOn<any>(service, 'isNameAvailable').and.returnValue(true); // eslint-disable-line
        spyOnProperty(checkSpy, 'sanitizedQuiz').and.returnValue(games[0]);

        await service.importQuiz(file);

        expect(nameSpy).toHaveBeenCalledWith(games[0]);
    });

    it('nameCheck should open import-error and call addToQuizList with new name', () => {
        const mockQuiz: Quiz = { id: '000004', title: 'first', questions: [] } as unknown as Quiz;
        QuizListComponent.quizzes = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];
        const errorComponent = service['handleErrorMessage']('error');
        spyOn(dialogSpy, 'open').and.returnValue(errorComponent);
        const spyAdd = spyOn<any>(service, 'addToQuizList'); // eslint-disable-line
        spyOn(errorComponent, 'afterClosed').and.returnValue(of({ id: '000004', title: 'quizNewName', questions: [] }));
        service['nameCheck'](mockQuiz);
        errorComponent.close();
        expect(spyAdd).toHaveBeenCalledWith({ id: '000004', title: 'quizNewName', questions: [] } as unknown as Quiz);
    });

    it('nameCheck should open import-error and call handleError if no new name is given', () => {
        const mockQuiz: Quiz = { id: '000004', title: 'first', questions: [] } as unknown as Quiz;
        QuizListComponent.quizzes = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];
        const errorComponent = service['handleErrorMessage']('error');
        const spyError = spyOn<any>(service, 'handleErrorMessage').and.returnValue(errorComponent); // eslint-disable-line
        spyOn(errorComponent, 'afterClosed').and.returnValue(of(null as unknown as Quiz));
        service['nameCheck'](mockQuiz);
        errorComponent.close();
        expect(spyError).toHaveBeenCalledTimes(2);
    });

    it('should open a mat dialog if an error is encountered', () => {
        const spy = spyOn(dialogSpy, 'open').and.returnValue({ componentInstance: { message: '' } } as MatDialogRef<unknown>);
        service['handleErrorMessage']('error');
        expect(spy).toHaveBeenCalledWith(ImportErrorComponent);
    });

    it('should call errorHandler when errors while adding quiz to database', () => {
        const errSpy = spyOn<any>(service, 'handleErrorMessage'); // eslint-disable-line
        const mockQuiz: Quiz = {} as unknown as Quiz;
        const addSpy = spyOn(quizServiceSpy, 'addQuiz').and.returnValue(throwError(() => new Error()));

        service['addToQuizList'](mockQuiz);

        expect(addSpy).toHaveBeenCalledWith(mockQuiz);
        expect(errSpy).toHaveBeenCalled();
    });

    it('should refresh location when quiz is added successfully', async () => {
        const mockQuiz: Quiz = { id: 'mockId', title: 'Mock Quiz', questions: [] } as unknown as Quiz;
        const addSpy = spyOn(quizServiceSpy, 'addQuiz').and.returnValue(of(true));
        const navigateSpy = spyOn<any>(service, 'stealthPageReload'); //eslint-disable-line

        service['addToQuizList'](mockQuiz);

        expect(addSpy).toHaveBeenCalledWith(mockQuiz);
        expect(navigateSpy).toHaveBeenCalled();
    });

    it('isNameAvailable return true if no other quiz in quizList have this name', () => {
        const quizNewName: Quiz = { id: '000004', title: 'forth', questions: [] } as unknown as Quiz;
        QuizListComponent.quizzes = [
            { id: '000001', title: 'first' },
            { id: '000002', title: 'second' },
            { id: '000003', title: 'third' },
        ] as Quiz[];

        const newQuiz = service['isNameAvailable'](quizNewName);
        expect(newQuiz).toBeTrue();
        const alreadyTakenName = service['isNameAvailable'](QuizListComponent.quizzes[0]);
        expect(alreadyTakenName).toBeFalse();
    });

    it('stealthPageReload should reload the page', async () => {
        const spynavigateURL = spyOn(router, 'navigateByUrl').and.resolveTo();
        service['stealthPageReload']();
        expect(spynavigateURL).toHaveBeenCalled();
    });
});
