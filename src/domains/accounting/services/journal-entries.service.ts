import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { JournalEntry, JournalEntrySearchParams, JournalEntriesResponse } from '../interfaces/journal-entity/journal-entry.interface';
import type { CreateJournalEntryDto, ReverseJournalEntryDto } from '../interfaces/journal-entity/journal-entry.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { JOURNAL_ENTRIES_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/journal-entries-messages.const';
import { APP_DEFAULTS } from '@core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class JournalEntriesService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/journalentries';

  readonly journalEntries = signal<JournalEntry[]>([]);
  readonly totalFilteredRecords = signal(0);
  readonly selectedEntry = signal<JournalEntry | null>(null);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // Search parameters with pagination
  readonly searchParams = signal<JournalEntrySearchParams>({
    offset: 0,
    limit: 50,
    orderBy: 'transactionDate',
    sortOrder: 'DESC'
  });

  // Computed values
  readonly total = computed(() => this.journalEntries().length);
  readonly totalDebits = computed(() =>
    this.journalEntries()
      .filter(entry => entry.entryType.value === 'DEBIT' || entry.entryType.code.includes('debit'))
      .reduce((sum, entry) => sum + entry.amount, 0)
  );
  readonly totalCredits = computed(() =>
    this.journalEntries()
      .filter(entry => entry.entryType.value === 'CREDIT' || entry.entryType.code.includes('credit'))
      .reduce((sum, entry) => sum + entry.amount, 0)
  );

  // Automatically re-fetch when reload or searchParams change
  private journalEntriesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() => {
        const params = this.buildSearchParams(this.searchParams());
        return this.http.get<JournalEntriesResponse>(this.baseUrl, { params }).pipe(
          tap((response) => {
            this.journalEntries.set(response.pageItems || []);
            this.totalFilteredRecords.set(response.totalFilteredRecords);
          }),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            console.error('Journal entries load error:', err);
            return of({ pageItems: [], totalFilteredRecords: 0 });
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [], totalFilteredRecords: 0 } }
  );

  // Trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // Update search parameters
  updateSearchParams(params: Partial<JournalEntrySearchParams>) {
    this.searchParams.update(current => ({ ...current, ...params }));
    this.refresh();
  }

  // Pagination methods
  nextPage() {
    const current = this.searchParams();
    const nextOffset = (current.offset || 0) + (current.limit || 50);
    this.updateSearchParams({ offset: nextOffset });
  }

  previousPage() {
    const current = this.searchParams();
    const prevOffset = Math.max(0, (current.offset || 0) - (current.limit || 50));
    this.updateSearchParams({ offset: prevOffset });
  }

  // CRUD Operations
  async createJournalEntry(data: CreateJournalEntryDto) {
    this.loading.set(true);

    try {
      const payload = {
        ...data,
        locale: APP_DEFAULTS.LOCALE,
        dateFormat: APP_DEFAULTS.DATE_FORMAT_API
      };

      await firstValueFrom(this.http.post(this.baseUrl, payload));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
      return true;
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
      console.error('Create journal entry error:', err);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async reverseJournalEntry(transactionId: string, comments: string = 'Reversal via UI') {
    this.loading.set(true);

    try {
      const payload: ReverseJournalEntryDto = {
        comments,
        reversalDate: new Date().toISOString().split('T')[0],
        locale: APP_DEFAULTS.LOCALE,
        dateFormat: APP_DEFAULTS.DATE_FORMAT_API
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${transactionId}`, payload)
      );
      this.notificationService.success(MSG.SUCCESS.REVERSED);
      this.refresh();
      return true;
    } catch (err) {
      this.notificationService.error(MSG.ERROR.REVERSE);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  // Get single journal entry
  getJournalEntry(journalEntryId: number) {
    return this.http.get<JournalEntry>(`${this.baseUrl}/${journalEntryId}`);
  }

  // Get journal entries by loan
  getJournalEntriesByLoan(loanId: number) {
    this.updateSearchParams({ loanId });
  }

  // Get journal entries by savings account
  getJournalEntriesBySavings(savingsId: number) {
    this.updateSearchParams({ savingsId });
  }

  // Get manual entries only
  getManualEntriesOnly() {
    this.updateSearchParams({ manualEntriesOnly: true });
  }

  // Get entries with running balance
  getEntriesWithRunningBalance() {
    this.updateSearchParams({ runningBalance: true });
  }

  // Get entries with transaction details
  getEntriesWithTransactionDetails() {
    this.updateSearchParams({ transactionDetails: true });
  }

  // Set selected entry
  setSelectedEntry(entry: JournalEntry | null) {
    this.selectedEntry.set(entry);
  }

  // Clear search
  clearSearch() {
    this.searchParams.set({
      offset: 0,
      limit: 50,
      orderBy: 'transactionDate',
      sortOrder: 'DESC'
    });
    this.refresh();
  }

  // Helper method to build search params
  private buildSearchParams(searchParams: JournalEntrySearchParams): HttpParams {
    let params = new HttpParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    // Add default locale and date format if dates are present
    if (searchParams.fromDate || searchParams.toDate) {
      params = params.set('locale', 'en').set('dateFormat', 'yyyy-MM-dd');
    }

    return params;
  }

  // Download template
  downloadTemplate() {
    return this.http.get(`${this.baseUrl}/downloadtemplate`, {
      responseType: 'blob'
    }).pipe(
      catchError((err) => {
        this.notificationService.error(MSG.ERROR.TEMPLATE_DOWNLOAD);
        throw err;
      })
    );
  }

  // Upload template
  async uploadTemplate(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/uploadtemplate`, formData)
      );
      this.notificationService.success(MSG.SUCCESS.TEMPLATE_UPLOADED);
      this.refresh();
      return true;
    } catch (err) {
      this.notificationService.error(MSG.ERROR.TEMPLATE_UPLOAD);
      return false;
    }
  }
}