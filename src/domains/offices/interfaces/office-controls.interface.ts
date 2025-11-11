import { FormControl } from '@angular/forms';

interface FormControls {
  name: FormControl<string>;
  parentId: FormControl<number | null>;
  openingDate: FormControl<string>;
}

export type OfficeControls = Record<number, FormControls>;