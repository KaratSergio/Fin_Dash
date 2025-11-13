import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom } from 'rxjs';

import { CurrencyOption, CurrencyConfigResponse } from '@domains/currencies/interfaces/currency.interface';
import { NotificationService } from '@core/services/notification/notification.service';
import { CURRENCY_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/currency-messages.const';

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/currencies';

  readonly allCurrencies = signal<CurrencyOption[]>([]);
  readonly selectedCurrencies = signal<CurrencyOption[]>([]);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // automatically fetch currencies whenever reload changes
  private currenciesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<CurrencyConfigResponse>(this.baseUrl).pipe(
          tap((res) => {
            this.allCurrencies.set(res.currencyOptions || []);
            this.selectedCurrencies.set(res.selectedCurrencyOptions || []);
          }),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of({ currencyOptions: [], selectedCurrencyOptions: [] });
          }),
        )
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // update permitted currencies
  async updateCurrencies(codes: string[]) {
    this.loading.set(true);
    try {
      const payload = { currencies: codes };
      await firstValueFrom(this.http.put(this.baseUrl, payload));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }
}