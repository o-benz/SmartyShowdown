import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseMultipleChoiceQuestion, Choice, TypeEnum } from '@app/interfaces/question-model';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { QuestionService } from '@app/services/question/question.service';

const MAXIMUM_NUMBER_OF_POINTS = 100;
const MINIMUM_NUMBER_OF_POINTS = 10;
const MINIMUM_CHOICES = 2;
const MAXIMUM_CHOICES = 4;
const BASE_10 = 10;

@Component({
    selector: 'app-new-question-form',
    templateUrl: './new-question-form.component.html',
    styleUrls: ['./new-question-form.component.scss'],
})
export class NewQuestionFormComponent implements OnInit {
    questionForm: FormGroup;
    protected newMultipleChoiceQuestion: BaseMultipleChoiceQuestion;
    protected newChoice: Choice;
    protected mode: 'create' | 'modify';

    // eslint-disable-next-line max-params
    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<NewQuestionFormComponent>,
        private questionService: QuestionService,
        private questionBankService: QuestionBankService,
        @Inject(MAT_DIALOG_DATA) public data: { baseQuestion: BaseMultipleChoiceQuestion | null },
    ) {}

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    ngOnInit() {
        this.mode = this.data.baseQuestion ? 'modify' : 'create';
        this.newMultipleChoiceQuestion = this.data.baseQuestion || {
            type: TypeEnum.QCM,
            text: '',
            points: 10,
            choices: [],
        };
        this.questionForm = this.fb.group({
            type: new FormControl(this.newMultipleChoiceQuestion.type, Validators.required),
            question: new FormControl(this.newMultipleChoiceQuestion.text, Validators.required),
            points: new FormControl(this.newMultipleChoiceQuestion.points, [
                Validators.required,
                Validators.min(MINIMUM_NUMBER_OF_POINTS),
                Validators.max(MAXIMUM_NUMBER_OF_POINTS),
                this.isMultipleOf10,
            ]),
            choices: this.fb.array(
                this.newMultipleChoiceQuestion.choices.map((choice) => this.fb.group(choice)),
                [Validators.required, Validators.minLength(MINIMUM_CHOICES), Validators.maxLength(MAXIMUM_CHOICES)],
            ),
        });
    }

    onSubmit(): void {
        const controls = [
            { control: this.questionForm.get('question'), name: 'Question' },
            { control: this.questionForm.get('points'), name: 'Points' },
            { control: this.questionForm.get('choices'), name: 'Choix' },
            { control: this.questionForm.get('type'), name: 'Type' },
        ];

        this.questionService.checkValidity(this.questionForm.value).subscribe((validQuestion) => {
            if (this.questionForm.valid && validQuestion) {
                this.dialogRef.close(this.questionForm.value as BaseMultipleChoiceQuestion);
            } else {
                if (this.questionForm.invalid) {
                    for (const { control, name } of controls) {
                        if (control?.errors) {
                            this.checkErrors(control, name);
                            break;
                        }
                    }
                } else {
                    window.alert('Formulaire invalide');
                }
            }
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }

    addMultipleChoice(text: string, isCorrect: boolean) {
        const choices = this.questionForm.get('choices') as FormArray;
        const choice: Choice = { text, isCorrect };
        this.questionBankService.addMultipleChoice(choices, choice, MAXIMUM_CHOICES);
    }

    deleteMultipleChoice(choice: Choice) {
        const choices = this.questionForm.get('choices') as FormArray;
        this.questionBankService.deleteMultipleChoice(choices, choice);
    }

    placeChoiceHigher(choice: Choice) {
        const choices = this.questionForm.get('choices') as FormArray;
        this.questionBankService.placeChoiceHigher(choices, choice);
    }

    placeChoiceLower(choice: Choice) {
        const choices = this.questionForm.get('choices') as FormArray;
        this.questionBankService.placeChoiceLower(choices, choice);
    }

    protected isMultipleOf10(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value % BASE_10 !== 0) {
            return { notMultipleOf10: true };
        }
        return null;
    }

    protected checkErrors(control: AbstractControl, controlName: string): void {
        this.questionBankService.checkErrors(control, controlName);
    }
}
