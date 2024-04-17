import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { games } from '@app/interfaces/quiz';
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

    it('export should download to computer', () => {
        const quiz: Quiz = games[0];
        const result = service.export(quiz);
        expect(result).toBe('data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(games[0])));
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
