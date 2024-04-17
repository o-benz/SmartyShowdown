import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorMessages } from '@app/interfaces/alert-messages';
import { Control } from '@app/interfaces/form-controls';
import { BaseQuestion, Choice, TypeEnum } from '@app/interfaces/question-model';
import { DialogAlertService } from '@app/services/dialog-alert-handler/dialog-alert.service';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { QuestionService } from '@app/services/question/question.service';

const MAXIMUM_NUMBER_OF_POINTS = 100;
const MINIMUM_NUMBER_OF_POINTS = 10;
const MINIMUM_CHOICES = 2;
const MAXIMUM_CHOICES = 4;
const MINIMUM_TRUE_CHOICES = 1;
const MINIMUM_FALSE_CHOICES = 1;
const MULTIPLE_IDENTIFIER = 10;

@Component({
    selector: 'app-new-question-form',
    templateUrl: './new-question-form.component.html',
    styleUrls: ['./new-question-form.component.scss'],
})
export class NewQuestionFormComponent implements OnInit {
    questionForm: FormGroup;
    protected newQuestion: BaseQuestion;
    protected newChoice: Choice;
    protected mode: 'create' | 'modify';

    // eslint-disable-next-line max-params
    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<NewQuestionFormComponent>,
        private questionService: QuestionService,
        private questionBankService: QuestionBankService,
        private dialogAlertService: DialogAlertService,
        @Inject(MAT_DIALOG_DATA) public data: { baseQuestion: BaseQuestion | null },
    ) {}

    protected get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    protected get type(): FormControl {
        return this.questionForm.get('type') as FormControl;
    }

    private get questionControls(): Control[] {
        return [
            { control: this.questionForm.get('text'), name: 'Question' },
            { control: this.questionForm.get('points'), name: 'Points' },
            { control: this.questionForm.get('choices'), name: 'Choix' },
            { control: this.questionForm.get('type'), name: 'Type' },
        ];
    }

    private get pointsValidators() {
        return [Validators.required, Validators.min(MINIMUM_NUMBER_OF_POINTS), Validators.max(MAXIMUM_NUMBER_OF_POINTS), this.isMultipleOfIdentifier];
    }

    private get typeValidators() {
        return [Validators.required];
    }

    private get questionValidators() {
        return [Validators.required];
    }

    private get choicesValidators() {
        return [
            Validators.required,
            Validators.minLength(MINIMUM_CHOICES),
            Validators.maxLength(MAXIMUM_CHOICES),
            this.minimumTrueChoices,
            this.minimumFalseChoices,
        ];
    }

    ngOnInit() {
        this.setupInitialData();
        this.initializeForm();
        this.setupTypeControl();
    }

    onSubmit(): void {
        this.questionService.checkValidity(this.questionForm.value).subscribe((validQuestion) => {
            if (this.questionForm.valid && validQuestion) {
                this.dialogRef.close(this.questionForm.value as BaseQuestion);
            } else {
                this.handleInvalidForm(this.questionControls);
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

    protected isMultipleOfIdentifier(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value % MULTIPLE_IDENTIFIER !== 0) {
            return { notMultipleOf10: true };
        }
        return null;
    }

    protected minimumTrueChoices(control: AbstractControl): { [key: string]: boolean } | null {
        const choices = control.value as Choice[];
        const trueChoices = choices.filter((choice) => choice.isCorrect);
        if (trueChoices.length < MINIMUM_TRUE_CHOICES) {
            return { notEnoughTrueChoices: true };
        }
        return null;
    }

    protected minimumFalseChoices(control: AbstractControl): { [key: string]: boolean } | null {
        const choices = control.value as Choice[];
        const falseChoices = choices.filter((choice) => !choice.isCorrect);
        if (falseChoices.length < MINIMUM_FALSE_CHOICES) {
            return { notEnoughFalseChoices: true };
        }
        return null;
    }

    protected checkErrors(control: AbstractControl, controlName: string): void {
        const formError = this.questionBankService.checkErrors(control, controlName);
        if (formError) {
            this.dialogAlertService.openErrorDialog(formError);
        }
    }

    private handleInvalidForm(controls: Control[]): void {
        if (this.questionForm.invalid) {
            this.findFirstError(controls);
        } else {
            this.dialogAlertService.openErrorDialog(ErrorMessages.InvalidForm);
        }
    }

    private findFirstError(controls: Control[]): void {
        for (const { control, name } of controls) {
            if (control?.errors) {
                this.checkErrors(control, name);
                break;
            }
        }
    }

    private getTypeFormControl(): FormControl {
        return new FormControl(this.newQuestion.type, this.typeValidators);
    }

    private getQuestionFormControl(): FormControl {
        return new FormControl(this.newQuestion.text, this.questionValidators);
    }

    private getPointsFormControl(): FormControl {
        return new FormControl(this.newQuestion.points, this.pointsValidators);
    }

    private getChoicesFormArray(): FormArray {
        const validators = this.newQuestion.type === TypeEnum.QRL ? null : this.choicesValidators;
        return new FormArray(this.newQuestion.choices ? this.newQuestion.choices.map((choice) => this.fb.group(choice)) : [], validators);
    }

    private setupInitialData() {
        this.mode = this.data.baseQuestion ? 'modify' : 'create';
        this.newQuestion = this.data.baseQuestion || {
            type: TypeEnum.QCM,
            text: '',
            points: MINIMUM_NUMBER_OF_POINTS,
            choices: [],
        };
    }

    private initializeForm() {
        this.questionForm = this.fb.group({
            type: this.getTypeFormControl(),
            text: this.getQuestionFormControl(),
            points: this.getPointsFormControl(),
            choices: this.getChoicesFormArray(),
        });
    }

    private setupTypeControl() {
        this.type.valueChanges.subscribe((type: string) => {
            if (type === 'QRL') {
                this.questionForm.removeControl('choices');
            } else if (type === 'QCM') {
                if (!this.questionForm.get('choices')) {
                    this.questionForm.addControl('choices', this.getChoicesFormArray());
                }
            }
        });
    }
}
