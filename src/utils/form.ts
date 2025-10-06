import { FormBuilder, Validators } from '@angular/forms';

export class FormUtils {
    constructor(private fb: FormBuilder) { }

    makeControl<T>(value: T, validators: any[] = []) {
        return this.fb.nonNullable.control(value, { validators });
    }

    requiredText(value: string = '') {
        return this.makeControl(value, [Validators.required]);
    }

    requiredEmail(value: string = '') {
        return this.makeControl(value, [Validators.required, Validators.email]);
    }

    optionalNumber(value: number | null = null) {
        return this.makeControl(value);
    }

    requiredNumber(value: number | null = null) {
        return this.makeControl(value, [Validators.required, Validators.min(0)]);
    }

    requiredDate(value: string | null = null) {
        return this.makeControl(value, [Validators.required]);
    }
}
