import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Charge } from '@domains/charges/interfaces/charge.interface';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-charges-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
  ],
  templateUrl: './charges-table.html',
  styleUrls: ['./charges-table.scss'],
})
export class ChargesTable {
  @Input() charges: Charge[] = [];
  @Input() chargeControls: Record<
    number,
    {
      name: FormControl<string>;
      amount: FormControl<number>;
      currencyCode: FormControl<string>;
    }
  > = {};
  @Input() currencies: { code: string; displayLabel: string }[] = [];

  @Output() update = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
