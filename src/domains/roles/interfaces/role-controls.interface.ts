import { FormControl } from "@angular/forms";

interface FormControls {
  name: FormControl<string>;
  description: FormControl<string>;
}

export type RoleControls = Record<number, FormControls>;
