import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { games } from '@app/interfaces/quiz';
import { Quiz } from '@app/interfaces/quiz-model';
import { ImportErrorComponent } from './import-error.component';

describe('ImportErrorComponent', () => {
    let component: ImportErrorComponent;
    let fixture: ComponentFixture<ImportErrorComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialogRef<ImportErrorComponent>>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);
        TestBed.configureTestingModule({
            declarations: [ImportErrorComponent],
            providers: [{ provide: MatDialogRef, useValue: spy }],
        });
        matDialogSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ImportErrorComponent>>;
        fixture = TestBed.createComponent(ImportErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('prepareNameCheck should prepare the compoenent befor sarting name checking', () => {
        const listeDeNom: string[] = ['un', 'deux', 'trois'];
        const quiz: Quiz = games[0];

        component.prepareNameCheck(quiz, listeDeNom);

        expect(component.listeDeNom).toEqual(listeDeNom);
        expect(component.quiz).toEqual(quiz);
        expect(component.nameAlreadyTaken).toBeTrue();
    });

    it('newName should clear the input field if the name entered is already taken', () => {
        component.prepareNameCheck(games[0], [games[0].title, games[1].title, 'trois']);
        component.inputValue = games[0].title;
        component.newName(component.inputValue);
        expect(component.inputValue).toEqual('');
    });

    it('newName should close and return the quiz with new name as promise', () => {
        component.prepareNameCheck(games[0], [games[0].title, games[1].title, 'trois']);
        component.inputValue = 'new Unused name';
        const expectedQuiz = games[0];
        expectedQuiz.title = component.inputValue;
        component.newName(component.inputValue);

        expect(matDialogSpy.close).toHaveBeenCalledWith(expectedQuiz);
    });
});
