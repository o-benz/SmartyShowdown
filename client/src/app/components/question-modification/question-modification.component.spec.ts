import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Question } from '@app/interfaces/quiz-model';
import { QuestionService } from '@app/services/question/question.service';
import { of } from 'rxjs';
import { QuestionModificationComponent } from './question-modification.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionModificationComponent', () => {
    let component: QuestionModificationComponent;
    let fixture: ComponentFixture<QuestionModificationComponent>;
    let dialogSpy: SpyObj<MatDialog>;
    const dialogRefSpyObj = jasmine.createSpyObj({ close: null });
    let questionServiceSpy: SpyObj<QuestionService>;

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'close']);

        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', [
            'addMultipleChoice',
            'deleteQuestion',
            'placeHigher',
            'placeLower',
            'checkValidity',
        ]);

        questionServiceSpy.checkValidity.and.returnValue(of(true));

        TestBed.configureTestingModule({
            declarations: [QuestionModificationComponent],
            imports: [MatDialogModule, HttpClientModule, FormsModule],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: QuestionService, useValue: questionServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionModificationComponent);
        component = fixture.componentInstance;
        component.question = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };

        component.dialogRef = dialogRefSpyObj;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call addMultipleChoice', () => {
        component.addMultipleChoice('text', true);
        expect(questionServiceSpy.addMultipleChoice).toHaveBeenCalled();
    });

    it('should call deleteQuestion', () => {
        component.deleteQuestion();
        expect(questionServiceSpy.deleteQuestion).toHaveBeenCalled();
    });

    it('should call placeQuestionHigher', () => {
        component.placeQuestionHigher();
        expect(questionServiceSpy.placeHigher).toHaveBeenCalled();
    });

    it('should call placeQuestionLower', () => {
        component.placeQuestionLower();
        expect(questionServiceSpy.placeLower).toHaveBeenCalled();
    });

    it('should call saveChanges', () => {
        component.saveChanges();
        expect(questionServiceSpy.checkValidity).toHaveBeenCalled();
    });

    it('should call closeDialog', async () => {
        component.dialogRef = dialogRefSpyObj;
        component['previousSelectedQuestion'] = {} as Question;
        component.question = JSON.parse(JSON.stringify({} as Question));
        component.closeDialog();
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    });

    it('should call openDialog', fakeAsync(() => {
        component.openDialog();
        component.question = {} as Question;
        tick();
        expect(dialogSpy.open).toHaveBeenCalled();
    }));

    it('should not closeDialog', async () => {
        component['previousSelectedQuestion'] = {} as Question;
        component.question = JSON.parse(JSON.stringify(component['previousSelectedQuestion']));
        component.closeDialog();
        expect(dialogRefSpyObj.close).toHaveBeenCalled();
    });

    it('should not saveChanges', () => {
        component.question.type = 'text';
        component.saveChanges();
        expect(questionServiceSpy.checkValidity).not.toHaveBeenCalled();
    });

    it('should show an alert if the question is not valid', () => {
        spyOn(window, 'alert');
        component.question.type = 'QCM';
        component['previousSelectedQuestion'] = {} as Question;
        questionServiceSpy.checkValidity.and.returnValue(of(false));
        component.saveChanges();
        fixture.detectChanges();
        expect(window.alert).toHaveBeenCalledWith('Question is not valid');
    });
});
