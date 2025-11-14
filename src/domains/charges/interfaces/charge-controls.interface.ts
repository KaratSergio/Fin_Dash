import { FormControl } from "@angular/forms";

interface FormControls {
  name: FormControl<string>;
  amount: FormControl<number>;
  currencyCode: FormControl<string>;
}

export type ChargeControls = Record<number, FormControls>;
