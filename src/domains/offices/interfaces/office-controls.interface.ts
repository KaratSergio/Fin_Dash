import { FormControl } from '@angular/forms';

export interface FormControls {
  name: FormControl<string>;
  parentId: FormControl<number | null>;
  openingDate: FormControl<string>;
}

export type OfficeControlsMap = Record<number, FormControls>;