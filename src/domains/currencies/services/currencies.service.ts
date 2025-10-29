import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap } from 'rxjs';
import { AppError } from '@core/utils/error';
import { CurrencyOption, CurrencyConfigResponse } from '../interfaces/currency.interface';

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/currencies';

  readonly allCurrencies = signal<CurrencyOption[]>([]);
  readonly selectedCurrencies = signal<CurrencyOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // automatically fetch currencies whenever reload changes
  private currenciesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<CurrencyConfigResponse>(this.baseUrl).pipe(
          tap((res) => {
            this.allCurrencies.set(res.currencyOptions || []);
            this.selectedCurrencies.set(res.selectedCurrencyOptions || []);
          }),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load currencies');
            return of({ currencyOptions: [], selectedCurrencyOptions: [] });
          }),
        )
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[CurrenciesService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // update permitted currencies
  updateCurrencies(codes: string[]) {
    const payload = { currencies: codes };
    return this.http.put(this.baseUrl, payload).pipe(
      tap(() => this.refresh()), // automatically reload after update
      catchError((err) => {
        this.error.set(err.message || 'Failed to update currencies');
        return of(null);
      })
    );
  }
}