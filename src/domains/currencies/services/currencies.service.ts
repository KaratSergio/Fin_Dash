import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface CurrencyOption {
  code: string; // Currency code, e.g., "USD"
  decimalPlaces: number; // Number of decimal places
  displayLabel: string; // Currency label with symbol
  displaySymbol: string; // Symbol, e.g., "$"
  inMultiplesOf: number; // Multiples for transactions
  name: string; // Full name of the currency
  nameCode: string; // Name code, e.g., "currency.USD"
}

export interface CurrencyConfigResponse {
  currencyOptions: CurrencyOption[]; // All available currencies
  selectedCurrencyOptions: CurrencyOption[]; // Permitted currencies
}

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/currencies';

  allCurrencies = signal<CurrencyOption[]>([]);
  selectedCurrencies = signal<CurrencyOption[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Fetch currency configuration with optional fields parameter
  private fetchCurrencies(fields?: string) {
    this.loading.set(true);

    // Add fields query param if provided
    let url = this.baseUrl;
    if (fields) {
      url += `?fields=${fields}`;
    }

    this.http
      .get<CurrencyConfigResponse>(url)
      .pipe(
        tap((res) => {
          this.allCurrencies.set(res.currencyOptions || []);
          this.selectedCurrencies.set(res.selectedCurrencyOptions || []);
        }),
        catchError((err) => {
          this.error.set(err.message || 'Failed to load currencies');
          return of({ currencyOptions: [], selectedCurrencyOptions: [] });
        }),
        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // CRUD
  // Public method to refresh currencies (optionally only selected)
  getCurrencies(onlySelected = false) {
    if (onlySelected) this.fetchCurrencies('selectedCurrencyOptions');
    else this.fetchCurrencies();
  }

  // Update permitted currencies (send array of currency codes)
  updateCurrencies(codes: string[]) {
    const payload = { currencies: codes };
    return this.http.put(this.baseUrl, payload).pipe(
      tap(() => this.fetchCurrencies()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update currencies');
        return of(null);
      }),
    );
  }
}

// in use
// Get all currencies
// currenciesService.getCurrencies();

// Get only selected currencies
// currenciesService.getCurrencies(true);
