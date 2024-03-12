import { AbstractControl } from '@angular/forms';

export interface Control {
    control: AbstractControl | null;
    name: string;
}
