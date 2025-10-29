import { FormBuilder, Validators, FormControl } from '@angular/forms';

export class FormUtils {
  constructor(private fb: FormBuilder) {}

  makeControl<T>(value: T, validators: any[] = []) {
    return this.fb.nonNullable.control(value, { validators }) as FormControl<T>;
  }

  requiredText<T extends string = string>(value: T = '' as T, maxLength?: number) {
    const validators = [Validators.required];
    if (maxLength) validators.push(Validators.maxLength(maxLength));
    return this.makeControl<T>(value, validators);
  }

  requiredEmail<T extends string = string>(value: T = '' as T) {
    return this.makeControl<T>(value, [Validators.required, Validators.email]);
  }

  optionalNumber<T extends number = number>(value: T = 0 as T) {
    return this.makeControl<T>(value);
  }

  requiredNumber(value: number | null = null) {
    return this.makeControl(value, [Validators.required, Validators.min(0)]);
  }

  requiredDate(value: Date | null = null) {
    return this.makeControl(value, [Validators.required]);
  }

  requiredNumberNN<T extends number = number>(value: T = 0 as T) {
    return this.makeControl<T>(value, [Validators.required, Validators.min(0)]);
  }

  makeBooleanNN<T extends boolean = boolean>(value: T = false as T) {
    return this.makeControl<T>(value);
  }

  makeEnumNN<T>(value: T) {
    return this.makeControl<T>(value);
  }
}
