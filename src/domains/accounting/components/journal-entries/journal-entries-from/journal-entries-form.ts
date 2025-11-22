import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-journal-entries-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatOptionModule, MatDatepickerModule,
    MatNativeDateModule, MatIconModule,
  ],
  templateUrl: './journal-entries-form.html',
  styleUrls: ['./journal-entries-form.scss'],
})
export class JournalEntriesForm {
  @Input() form!: FormGroup;

  @Output() create = new EventEmitter<void>();

  constructor(private fb: FormBuilder) { }

  get entries(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  addEntryLine() {
    const entryGroup = this.fb.group({
      glAccountId: [''],
      amount: [''],
      entryType: ['DEBIT'],
      comments: ['']
    });
    this.entries.push(entryGroup);
  }

  removeEntryLine(index: number) {
    this.entries.removeAt(index);
  }

  getTotalDebits(): number {
    return this.entries.controls
      .filter(control => control.get('entryType')?.value === 'DEBIT')
      .reduce((sum, control) => sum + (Number(control.get('amount')?.value) || 0), 0);
  }

  getTotalCredits(): number {
    return this.entries.controls
      .filter(control => control.get('entryType')?.value === 'CREDIT')
      .reduce((sum, control) => sum + (Number(control.get('amount')?.value) || 0), 0);
  }

  isBalanced(): boolean {
    return this.getTotalDebits() === this.getTotalCredits();
  }
}