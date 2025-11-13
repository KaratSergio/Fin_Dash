import { FormControl } from "@angular/forms";

interface FormControls {
  firstname: FormControl<string | null>;
  lastname: FormControl<string | null>;
  emailAddress: FormControl<string | null>;
  mobileNo: FormControl<string | null>;
  office: FormControl<number | null>;
}

export type ClientControls = Record<number, FormControls>;
