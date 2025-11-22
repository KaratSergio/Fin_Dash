import { FormControl } from "@angular/forms";

interface FormControls {
  name: FormControl<string>;
  glCode: FormControl<string>;
  description: FormControl<string>;
  manualEntriesAllowed: FormControl<boolean>;
}

export type GLAccountControls = Record<number, FormControls>;
