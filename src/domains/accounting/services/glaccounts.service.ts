import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith } from 'rxjs';
import { GLAccount } from '../interfaces/gl-account.interface';
import {
  GLAccountCreateDto,
  GLAccountUpdateDto,
  GLAccountsTemplateResponseDto,
} from '../interfaces/gl-account.dto';
import { AppError } from '@core/utils/error';

@Injectable({ providedIn: 'root' })
export class GLAccountsService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/glaccounts';

  // signals
  readonly accounts = signal<GLAccount[]>([]);
  readonly total = computed(() => this.accounts().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // cache
  private cache: GLAccount[] | null = null;
  private cacheTime = 0;
  private readonly CACHE_TTL = 300_000; // 5 min

  // template as reactive signal (single load)
  readonly template = toSignal(
    this.http.get<GLAccountsTemplateResponseDto>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.error.set(err.message || 'Failed to load GL template');
        return of(null);
      }),
    ),
    { initialValue: null },
  );

  // automatically re-fetch accounts when reload changes
  readonly accountsLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() => {
        const now = Date.now();

        if (this.cache && now - this.cacheTime < this.CACHE_TTL) {
          return of(this.cache);
        }

        return this.http.get<GLAccount[]>(this.baseUrl).pipe(
          tap((res) => {
            this.cache = res;
            this.cacheTime = Date.now();
          }),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load GL accounts');
            return of([]);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] },
  );

  // keep accounts signal in sync with loader
  private syncAccounts = effect(() => {
    const list = this.accountsLoader();
    if (list) this.accounts.set(list);
  });

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[GLAccountsService]', err);
  });

  refresh() {
    this.cache = null;
    this.reload.update((n) => n + 1);
  }

  // CRUD
  createAccount(payload: GLAccountCreateDto) {
    this.loading.set(true);
    return this.http.post(this.baseUrl, payload).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to create GL account');
        return of(null);
      }),
      tap(() => this.loading.set(false)),
    );
  }

  updateAccount(id: number, payload: GLAccountUpdateDto) {
    this.loading.set(true);
    return this.http.put(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update GL account');
        return of(null);
      }),
      tap(() => this.loading.set(false)),
    );
  }

  deleteAccount(id: number) {
    this.loading.set(true);
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to delete GL account');
        return of(null);
      }),
      tap(() => this.loading.set(false)),
    );
  }
}
