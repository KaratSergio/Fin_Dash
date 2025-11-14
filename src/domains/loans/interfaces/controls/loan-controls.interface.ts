import { FormControl } from "@angular/forms";

interface FormControls {
  principal: FormControl<number | null>;
  expectedDisbursementDate: FormControl<string | null>;
  status: FormControl<string | null>;
}

export type LoanControls = Record<number, FormControls>;
