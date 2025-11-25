import { Component, input, output } from '@angular/core';
import type { JournalEntrySearchParams } from '@domains/accounting/interfaces/journal-entity/journal-entry.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectChange } from '@angular/material/select';

type FilterChangeEvent =
  | { type: 'transactionId'; value: string }
  | { type: 'fromDate'; value: string }
  | { type: 'toDate'; value: string }
  | { type: 'entityType'; value: number | undefined };

@Component({
  selector: 'app-journal-entries-filters',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './journal-entries-filters.html',
  styleUrls: ['./journal-entries-filters.scss']
})
export class JournalEntriesFilters {
  // Inputs
  searchFilters = input.required<Partial<JournalEntrySearchParams>>();

  // Outputs
  filtersChange = output<Partial<JournalEntrySearchParams>>();
  clearSearch = output<void>();

  onTransactionIdChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.emitFilterChange({ transactionId: value });
  }

  onFromDateChange(event: MatDatepickerInputEvent<Date>): void {
    const value = event.value ? this.formatDate(event.value) : '';
    this.emitFilterChange({ fromDate: value });
  }

  onToDateChange(event: MatDatepickerInputEvent<Date>): void {
    const value = event.value ? this.formatDate(event.value) : '';
    this.emitFilterChange({ toDate: value });
  }

  onEntityTypeChange(event: MatSelectChange): void {
    const value = event.value;
    const entityType = value ? +value : undefined;
    this.emitFilterChange({ entityType });
  }

  onClearSearch(): void {
    this.clearSearch.emit();
  }

  private emitFilterChange(filters: Partial<JournalEntrySearchParams>): void {
    this.filtersChange.emit(filters);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}