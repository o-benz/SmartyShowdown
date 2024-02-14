import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '@app/interfaces/quiz-model';

@Component({
    selector: 'app-import-error',
    templateUrl: './import-error.component.html',
    styleUrls: ['./import-error.component.scss'],
})
export class ImportErrorComponent {
    message: string;
    nameAlreadyTaken: boolean = false;
    quiz: Quiz;
    listeDeNom: string[];
    inputValue: string = '';

    constructor(private dialogRef: MatDialogRef<ImportErrorComponent>) {}

    prepareNameCheck(quiz: Quiz, listeDeNom: string[]) {
        this.quiz = quiz;
        this.listeDeNom = listeDeNom;
        this.nameAlreadyTaken = true;
    }

    newName(input: string) {
        const name: string = input;
        if (this.listeDeNom.includes(name)) {
            this.nameAlreadyTaken = true;
            this.inputValue = '';
        } else {
            this.nameAlreadyTaken = false;
            this.quiz.title = name;
            this.dialogRef.close(this.quiz);
        }
    }
}
