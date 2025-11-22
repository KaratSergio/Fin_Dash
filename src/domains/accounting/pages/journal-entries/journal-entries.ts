import { RouterModule } from '@angular/router';
import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from '@core/utils/form';

import { JournalEntriesService } from '@domains/accounting/services/journal-entries.service';
import type { CreateJournalEntryDto } from '@domains/accounting/interfaces/journal-entity/journal-entry.dto';
import type { JournalEntrySearchParams } from '@domains/accounting/interfaces/journal-entity/journal-entry.interface';
import type { JournalEntryControls } from '@domains/accounting/interfaces/journal-entity/journal-entry-controls.interface';

import { JournalEntriesForm } from '../../components/journal-entries/journal-entries-from/journal-entries-form';
import { JournalEntriesTable } from '../../components/journal-entries/journal-entries-table/journal-entries-table';

@Component({
  selector: 'app-admin-journal-entries',
  standalone: true,
  imports: [RouterModule, JournalEntriesForm, JournalEntriesTable],
  templateUrl: './journal-entries.html',
  styleUrls: ['./journal-entries.scss'],
})
export class JournalEntriesPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);
  private journalService = inject(JournalEntriesService);

  readonly journalEntries = this.journalService.journalEntries;
  readonly loading = this.journalService.loading;
  readonly totalFilteredRecords = this.journalService.totalFilteredRecords;
  readonly selectedEntry = this.journalService.selectedEntry;

  readonly totalDebits = this.journalService.totalDebits;
  readonly totalCredits = this.journalService.totalCredits;

  // Search filters
  readonly searchFilters = signal<Partial<JournalEntrySearchParams>>({
    officeId: undefined,
    glAccountId: undefined,
    transactionId: '',
    fromDate: '',
    toDate: '',
    entityType: undefined
  });

  // Form for creating a new journal entry
  createForm = this.fb.group({
    officeId: this.utils.requiredNumberNN(0),
    transactionDate: this.utils.requiredText(),
    currencyCode: this.utils.requiredText('USD'),
    referenceNumber: this.utils.requiredText(),
    comments: this.utils.makeControl(''),
    paymentTypeId: this.utils.optionalNumber(),
    accountNumber: this.utils.makeControl(''),
    checkNumber: this.utils.makeControl(''),
    receiptNumber: this.utils.makeControl(''),
    entries: this.fb.array([]) // Will be handled in child component
  });

  // Controls for editing each journal entry (for comments etc.)
  readonly entryControls: JournalEntryControls = {};

  // Load journal entries initially
  private loadEntries = effect(() => {
    const list = this.journalEntries();
    const ids = new Set(list.map((entry) => entry.id));

    // Remove controls for deleted entries
    for (const id of Object.keys(this.entryControls)) {
      if (!ids.has(Number(id))) delete this.entryControls[Number(id)];
    }

    // Create or update controls for existing entries
    list.forEach((entry) => {
      if (!this.entryControls[entry.id]) {
        this.entryControls[entry.id] = {
          comments: this.utils.makeControl(entry.comments ?? ''),
          referenceNumber: this.utils.requiredText(entry.referenceNumber),
        };
      } else {
        const c = this.entryControls[entry.id];
        c.comments.setValue(entry.comments ?? '', { emitEvent: false });
        c.referenceNumber.setValue(entry.referenceNumber, { emitEvent: false });
      }
    });
  });

  // Actions
  createEntry() {
    if (this.createForm.invalid) return;

    const formValue = this.createForm.getRawValue();
    const dto: CreateJournalEntryDto = {
      officeId: formValue.officeId!,
      transactionDate: formValue.transactionDate!,
      currencyCode: formValue.currencyCode!,
      referenceNumber: formValue.referenceNumber!,
      comments: formValue.comments,
      paymentTypeId: formValue.paymentTypeId,
      accountNumber: formValue.accountNumber,
      checkNumber: formValue.checkNumber,
      receiptNumber: formValue.receiptNumber,
      entries: [] // Will be populated from child component
    };

    this.journalService.createJournalEntry(dto);

    this.createForm.reset({
      officeId: 0,
      transactionDate: '',
      currencyCode: 'USD',
      referenceNumber: '',
      comments: '',
      paymentTypeId: 0,
      accountNumber: '',
      checkNumber: '',
      receiptNumber: ''
    });
  }

  reverseEntry(transactionId: string) {
    this.journalService.reverseJournalEntry(transactionId);
  }

  updateSearchFilters(filters: Partial<JournalEntrySearchParams>) {
    this.searchFilters.update(current => ({ ...current, ...filters }));
    this.journalService.updateSearchParams(filters);
  }

  clearSearch() {
    this.searchFilters.set({
      officeId: undefined,
      glAccountId: undefined,
      transactionId: '',
      fromDate: '',
      toDate: '',
      entityType: undefined
    });
    this.journalService.clearSearch();
  }

  selectEntry(entry: any) {
    this.journalService.setSelectedEntry(entry);
  }

  nextPage() {
    this.journalService.nextPage();
  }

  previousPage() {
    this.journalService.previousPage();
  }

  onTransactionIdChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateSearchFilters({ transactionId: value });
  }

  onFromDateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateSearchFilters({ fromDate: value });
  }

  onToDateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateSearchFilters({ toDate: value });
  }

  onEntityTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const entityType = value ? +value : undefined;
    this.updateSearchFilters({ entityType });
  }
}