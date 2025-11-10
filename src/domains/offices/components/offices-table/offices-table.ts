import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';

import { Office } from '@domains/offices/interfaces/office.interface';
import { OfficeControlsMap } from '@domains/offices/interfaces/office-controls.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-offices-table',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, FormatDatePipe],
  templateUrl: './offices-table.html',
  styleUrls: ['./offices-table.scss'],
})
export class OfficesTable {
  @Input() offices: Office[] = [];
  @Input() officeControls: OfficeControlsMap = {};

  @Output() update = new EventEmitter<Office>();
}
