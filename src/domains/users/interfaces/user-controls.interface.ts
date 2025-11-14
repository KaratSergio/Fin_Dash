import { FormControl } from "@angular/forms";

interface FormControls {
  username: FormControl<string | null>;
  firstname: FormControl<string | null>;
  lastname: FormControl<string | null>;
  email: FormControl<string | null>;
  roles: FormControl<number[]>;
  office: FormControl<number | null>;
}

export type UserControls = Record<number, FormControls>;
