import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Quiz } from '@app/interfaces/quiz-model';
import { AdminQuizHandler } from '@app/services/admin-quiz-handler/admin-quiz-handler.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('AdminQuizHandlerService', () => {
    let service: AdminQuizHandler;
    let httpSpy: jasmine.SpyObj<HttpClient>;
    beforeEach(() => {
        const spyHttp = jasmine.createSpyObj('HttpClient', ['delete', 'put']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: httpSpy, useValue: spyHttp }],
        });

        service = TestBed.inject(AdminQuizHandler);
        httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('export should call the library with the right argument', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'libraryCaller');
        const quiz: Quiz = { title: 'titre' } as Quiz;
        const data = quiz;
        const fileName = quiz.title;
        const exportType = 'json';
        service.export(quiz);
        expect(spy).toHaveBeenCalledWith({ data, fileName, exportType });
    });

    it('delete should call an http delete with the right arguments', () => {
        const quizID = '000001';
        const spy = spyOn(httpSpy, 'delete').and.returnValue(of());
        service.delete(quizID);
        expect(spy).toHaveBeenCalledWith(`${environment.serverUrl}/quiz/${quizID}`);
    });

    it('toggleQuizVisibility should call an http put with the right arguments', () => {
        const quizID = '000001';
        const spy = spyOn(httpSpy, 'put').and.returnValue(of({} as Quiz));
        service.toggleQuizVisibility(quizID);
        expect(spy).toHaveBeenCalledWith(`${environment.serverUrl}/quiz/${quizID}`, {});
    });
});
