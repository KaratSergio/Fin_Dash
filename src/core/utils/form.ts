import { FormBuilder, Validators } from '@angular/forms';

export class FormUtils {
    constructor(private fb: FormBuilder) { }

    makeControl<T>(value: T, validators: any[] = []) {
        return this.fb.nonNullable.control(value, { validators });
    }

    requiredText(value: string = '', maxLength?: number) {
        const validators = [Validators.required];
        if (maxLength) validators.push(Validators.maxLength(maxLength));
        return this.makeControl(value, validators);
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

    requiredDate(value: Date | null = null) {
        return this.makeControl(value, [Validators.required]);
    }

    requiredNumberNN(value: number = 0) {
        return this.makeControl(value, [Validators.required, Validators.min(0)]);
    }

    makeBooleanNN(value: boolean = false) {
        return this.makeControl(value);
    }

    makeEnumNN<T>(value: T) {
        return this.makeControl(value);
    }
}
