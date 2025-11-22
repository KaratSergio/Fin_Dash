import { FormControl } from "@angular/forms";

export interface JournalEntryControls {
  [id: number]: {
    comments: FormControl<string | null>;
    referenceNumber: FormControl<string>;
  };
}