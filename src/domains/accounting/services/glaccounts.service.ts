import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Injectable, inject, signal, computed } from '@angular/core';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { GLAccount } from '../interfaces/gl-account.interface';
import type { GLAccountCreateDto, GLAccountUpdateDto, GLAccountsTemplateResponseDto } from '../interfaces/gl-account.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { GL_ACCOUNT_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/gl-account-messages.const';

@Injectable({ providedIn: 'root' })
export class GLAccountsService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/glaccounts';

  readonly accounts = signal<GLAccount[]>([]);
  readonly total = computed(() => this.accounts().length);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // cache
  private cache: GLAccount[] | null = null;
  private cacheTime = 0;
  private readonly CACHE_TTL = 300_000; // 5 min

  // template as reactive signal (single load)
  readonly template = toSignal(
    this.http.get<GLAccountsTemplateResponseDto>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.notificationService.error(MSG.ERROR.TEMPLATE_LOAD);
        return of(null);
      }),
    ),
    { initialValue: null },
  );

  // automatically re-fetch accounts when reload changes
  private accountsLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
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
            this.notificationService.error(MSG.ERROR.LOAD);
            return of([]);
          }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] },
  );

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
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateAccount(id: number, payload: GLAccountUpdateDto) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<GLAccount>(`${this.baseUrl}/${id}`, payload));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteAccount(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh(true); // reboot without cache
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
    } finally {
      this.loading.set(false);
    }
  }
}