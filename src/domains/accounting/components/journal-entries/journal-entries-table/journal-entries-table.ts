import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import type { JournalEntry } from '@domains/accounting/interfaces/journal-entity/journal-entry.interface';
import type { JournalEntryControls } from '@domains/accounting/interfaces/journal-entity/journal-entry-controls.interface';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-journal-entries-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule, MatButtonModule, MatSelectModule,
    MatOptionModule, MatIconModule
  ],
  templateUrl: './journal-entries-table.html',
  styleUrls: ['./journal-entries-table.scss'],
})
export class JournalEntriesTable {
  @Input() journalEntries: JournalEntry[] = [];
  @Input() entryControls: JournalEntryControls = {};
  @Input() selectedEntry: JournalEntry | null = null;

  @Output() update = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() reverse = new EventEmitter<string>();
  @Output() select = new EventEmitter<JournalEntry>();

  getEntryTypeClass(entryTypeValue: string): string {
    switch (entryTypeValue) {
      case 'ASSET': return 'asset';
      case 'LIABILITY': return 'liability';
      case 'INCOME': return 'income';
      case 'EXPENSE': return 'expense';
      case 'EQUITY': return 'equity';
      default: return 'default';
    }
  }
}