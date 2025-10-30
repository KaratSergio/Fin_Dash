import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import { GLAccount } from '../interfaces/gl-account.interface';
import {
  GLAccountCreateDto, GLAccountUpdateDto,
  GLAccountsTemplateResponseDto,
} from '../interfaces/gl-account.dto';

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
  private accountsLoader = toSignal(
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
          tap((list) => this.accounts.set(list)),
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

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[GLAccountsService]', err);
  });

  // trigger reload
  refresh(force = false) {
    if (force) this.cache = null; // if true = reset cache
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createAccount(payload: GLAccountCreateDto) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post<GLAccount>(this.baseUrl, payload));
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create GL account'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateAccount(id: number, payload: GLAccountUpdateDto) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<GLAccount>(`${this.baseUrl}/${id}`, payload));
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update GL account'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteAccount(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete GL account'));
    } finally {
      this.loading.set(false);
    }
  }
}