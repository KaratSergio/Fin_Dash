import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith } from 'rxjs';
import { AppError } from '@core/utils/error';
import { Charge, ChargeTemplate } from '../interfaces/charge.interface';
import { ChargeCreateDto, ChargeUpdateDto, ChargeBaseFields } from '../interfaces/charge.dto';

@Injectable({ providedIn: 'root' })
export class ChargesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/charges';

  readonly charges = signal<Charge[]>([]);
  readonly total = computed(() => this.charges().length)
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // Get charges list
  readonly template = toSignal(
    this.http.get<ChargeTemplate>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.error.set(err.message || 'Failed to load charge template');
        return of(null);
      })
    ),
    { initialValue: null }
  );
  
  // automatically re-fetch charges when reload changes
  readonly chargesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<Charge[]>(this.baseUrl).pipe(
          catchError((err) => {
            this.error.set(err.message || 'Failed to load charges');
            return of([]);
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // keep charges signal in sync with loader
  private syncCharges = effect(() => {
    const list = this.chargesLoader();
    if (list) this.charges.set(list);
  });

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[ChargesService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  createCharge(data: Pick<ChargeBaseFields, 'name' | 'amount' | 'currencyCode' | 'penalty'>) {
    this.loading.set(true);
    const payload: ChargeCreateDto = {
      active: true,
      chargeAppliesTo: 1,
      chargeCalculationType: 1,
      chargePaymentMode: 1,
      chargeTimeType: 1,
      enablePaymentType: true,
      locale: 'en',
      ...data,
      // taxGroupId: 1,
    };

    return this.http.post<Charge>(this.baseUrl, payload).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to create charge');
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  updateCharge(chargeId: number, data: ChargeUpdateDto) {
    this.loading.set(true);
    const payload: ChargeUpdateDto = {
      active: true,
      chargeAppliesTo: 1,
      chargeCalculationType: 1,
      chargePaymentMode: 1,
      chargeTimeType: 1,
      enablePaymentType: true,
      locale: 'en',
      ...data,
      // taxGroupId: 1,
    };

    return this.http.put<Charge>(`${this.baseUrl}/${chargeId}`, payload).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update charge');
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  deleteCharge(chargeId: number) {
    this.loading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/${chargeId}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to delete charge');
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  // get single charge
  getCharge(chargeId: number) {
    return this.http.get<Charge>(`${this.baseUrl}/${chargeId}`);
  }
}
