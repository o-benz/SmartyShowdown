import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { Choice } from '@app/interfaces/quiz-model';

@Injectable({
    providedIn: 'root',
})
export class QuestionBankService {
    constructor(private fb: FormBuilder) {}

    addMultipleChoice(choices: FormArray, choice: Choice, maximumChoices: number) {
        if (choice.text !== '' && choices.value.length < maximumChoices) choices.push(this.fb.group(choice));
    }

    deleteMultipleChoice(choices: FormArray, choice: Choice) {
        const foundControl = choices.controls.find((c) => c.value === choice);
        if (foundControl) {
            const index = choices.controls.indexOf(foundControl);
            choices.removeAt(index);
        }
    }

    placeChoiceHigher(choices: FormArray, choice: Choice) {
        const index = choices.value.indexOf(choice);
        if (index > 0) {
            const previousValue = choices.at(index - 1).value;
            const currentValue = choices.at(index).value;
            choices.at(index - 1).setValue(currentValue);
            choices.at(index).setValue(previousValue);
        }
    }

    placeChoiceLower(choices: FormArray, choice: Choice) {
        const index = choices.value.indexOf(choice);
        if (index < choices.value.length - 1) {
            const followingValue = choices.at(index + 1).value;
            const currentValue = choices.at(index).value;
            choices.at(index + 1).setValue(currentValue);
            choices.at(index).setValue(followingValue);
        }
    }

    checkErrors(control: AbstractControl, controlName: string): string | null {
        const errorMessages: { [key: string]: string } = {
            required: `${controlName} est nécessaire`,
            min: `${controlName} doit être au moins ${control?.errors?.min?.min}`,
            max: `${controlName} doit être au maximum ${control?.errors?.max?.max}`,
            minlength: `${controlName} doit avoir au moins ${control?.errors?.minlength?.requiredLength} choix`,
            maxlength: `${controlName} doit avoir au maximum ${control?.errors?.maxlength?.requiredLength} choix`,
            notMultipleOf10: `${controlName} doit être un multiple de 10`,
        };

        const errorKey = Object.keys(control.errors || {}).find((key) => control.getError(key));

        return errorKey ? errorMessages[errorKey] : null;
    }
}
