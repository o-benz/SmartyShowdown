import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ImportQuizComponent } from '@app/components/import-quiz/import-quiz.component';
import { Quiz } from '@app/interfaces/quiz-model';
import { AdminQuizHandler } from '@app/services/admin-quiz-handler/admin-quiz-handler.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { QuizListComponent } from './quiz-list.component';

describe('QuizListComponent', () => {
    let component: QuizListComponent;
    let fixture: ComponentFixture<QuizListComponent>;
    let adminQuizHandlerSpy: jasmine.SpyObj<AdminQuizHandler>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const spyQuizService = jasmine.createSpyObj('QuizService', ['getAllQuiz']);
        const activatedRouteStub = {
            paramMap: of({
                get: () => '123',
            }),
        };
        TestBed.configureTestingModule({
            declarations: [QuizListComponent, ImportQuizComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: adminQuizHandlerSpy, useValue: jasmine.createSpyObj('AdminQuizHandler', ['toggleQuizVisibility', 'delete']) },
                { provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: quizServiceSpy, useValue: spyQuizService },
                { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'close']) },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        });
        adminQuizHandlerSpy = TestBed.inject(AdminQuizHandler) as jasmine.SpyObj<AdminQuizHandler>;

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        spyOn(quizServiceSpy, 'getAllQuiz').and.returnValue(
            of([
                { id: '000001', visible: false },
                { id: '000002', visible: true },
                { id: '000003', visible: true },
                { id: '000004', visible: false },
            ] as Quiz[]),
        );

        fixture = TestBed.createComponent(QuizListComponent);
        component = fixture.componentInstance;
        component.quizzes = [
            { id: '000001', visible: false },
            { id: '000002', visible: true },
            { id: '000003', visible: true },
            { id: '000004', visible: false },
        ] as unknown as Quiz[];
        component['exportLink'] = {
            nativeElement: {
                click: () => {
                    /* body*/
                },
            },
        } as ElementRef;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call a service to export a quiz', () => {
        const spy = spyOn(component['adminQuizHandler'], 'export');
        component.export({} as Quiz);
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to page to modify quiz', () => {
        const id = '123456';
        const spy = spyOn(routerSpy, 'navigate');
        component.modify({ id } as Quiz);
        expect(spy).toHaveBeenCalledWith(['/createquiz'], { queryParams: { id } });
    });

    it('should navigate to create quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.create();
        expect(spy).toHaveBeenCalledWith(['/createquiz']);
    });

    it('should navigate to question bank', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.questionBank();
        expect(spy).toHaveBeenCalledWith(['/questionbank']);
    });

    it('delete quiz should remove quiz from list if the service return true', (done) => {
        const id = '000001';
        const handlerSpy = spyOn(adminQuizHandlerSpy, 'delete').and.returnValue(of(undefined));
        spyOn(window, 'confirm').and.returnValue(true);

        component.delete(id).then(() => {
            expect(handlerSpy).toHaveBeenCalledWith(id);
            expect(component.quizzes).not.toContain({ id } as Quiz);
            done();
        });
    });

    it('delete quiz should modifie error message if the service return false', async () => {
        const id = '000001';
        spyOn(adminQuizHandlerSpy, 'delete').and.returnValue(throwError(() => new Error('error')));
        spyOn(window, 'confirm').and.returnValue(true);

        component.delete(id).then(() => {
            expect(component.quizzes).toContain({ id, visible: false } as Quiz);
        });
    });

    it('hide quiz should change visibility of quiz on list', async () => {
        const id = '000001';
        const quiz: Quiz = component.quizzes[0];
        quiz.visible = true;
        const handlerSpy = spyOn(adminQuizHandlerSpy, 'toggleQuizVisibility').and.returnValue(of(quiz));

        component.hide(quiz).then(() => {
            expect(handlerSpy).toHaveBeenCalledWith(id);
            expect(component.quizzes[0].visible).toBeTrue();
        });
    });

    it('hide quiz should modifie error message if the service return false', async () => {
        const id = '000001';
        const quiz: Quiz = component.quizzes[0];
        const handlerSpy = spyOn(adminQuizHandlerSpy, 'toggleQuizVisibility').and.returnValue(throwError(() => new Error('{status: 404}')));

        component.hide(quiz);

        expect(handlerSpy).toHaveBeenCalledWith(id);
        expect(component.quizzes[0].visible).toBeFalse();
    });

    it('delete quiz should modify error message if the service return nothing', async () => {
        const id = '000001';
        spyOn(adminQuizHandlerSpy, 'delete').and.returnValue(throwError(() => new Error('{status: 404}')));
        spyOn(window, 'confirm').and.returnValue(true);

        component.delete(id).then(() => {
            expect(component.quizzes).toContain({ id, visible: false } as Quiz);
        });
    });
});
