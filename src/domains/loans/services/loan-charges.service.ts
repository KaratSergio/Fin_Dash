import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import type { LoanCharge, LoanChargeTemplate } from '../interfaces/loan-charge.interface';
import type { CreateLoanChargeDto, UpdateLoanChargeDto, PayLoanChargeDto, WaiveLoanChargeDto, AdjustLoanChargeDto } from '../interfaces/dto/loan-charge.dto';

// Its typical for MFIs to add extra costs for their loan products.They can be either Fees or Penalties.

// Loan Charges are instances of Charges and represent either fees and penalties for loan products.
// Refer Charges for documentation of the various properties of a charge, 
// Only additional properties(specific to the context of a Charge being associated with a Loan) are described here

@Injectable({ providedIn: 'root' })
export class LoanChargesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/v1/loans';

  readonly charges = signal<LoanCharge[]>([]);
  readonly total = computed(() => this.charges().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);
  private readonly currentLoanId = signal<number | null>(null);

  // Template signal
  readonly template = toSignal(
    toObservable(this.currentLoanId).pipe(
      switchMap((loanId) => {
        if (!loanId) return of(null);
        return this.http.get<LoanChargeTemplate>(`${this.baseUrl}/${loanId}/charges/template`).pipe(
          catchError((err) => {
            this.error.set(handleError(err, 'Failed to load loan charge template'));
            return of(null);
          })
        );
      })
    ),
    { initialValue: null }
  );

  // automatically re-fetch charges when reload or loanId changes
  private chargesLoader = toSignal(
    toObservable(computed(() => ({
      reload: this.reload(),
      loanId: this.currentLoanId()
    }))).pipe(
      startWith({ reload: 0, loanId: null }),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({ loanId }) => {
        if (!loanId) return of([]);

        return this.http.get<LoanCharge[]>(`${this.baseUrl}/${loanId}/charges`).pipe(
          tap((res) => this.charges.set(res || [])),
          catchError((err) => {
            this.error.set(handleError(err, 'Failed to load loan charges'));
            return of([]);
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[LoanChargesService]', err);
  });

  // Set current loan ID and trigger reload
  setLoanId(loanId: number) {
    this.currentLoanId.set(loanId);
    this.refresh();
  }

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createCharge(loanId: number, data: CreateLoanChargeDto) {
    this.loading.set(true);

    try {
      const payload = {
        ...data,
        locale: data.locale || 'en',
        dateFormat: data.dateFormat || 'yyyy-MM-dd',
      };

      await firstValueFrom(this.http.post<LoanCharge>(`${this.baseUrl}/${loanId}/charges`, payload));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateCharge(loanId: number, chargeId: number, data: UpdateLoanChargeDto) {
    this.loading.set(true);

    try {
      const payload = {
        ...data,
        locale: data.locale || 'en',
        dateFormat: data.dateFormat || 'yyyy-MM-dd',
      };

      await firstValueFrom(
        this.http.put<LoanCharge>(`${this.baseUrl}/${loanId}/charges/${chargeId}`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteCharge(loanId: number, chargeId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${loanId}/charges/${chargeId}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  // get single charge
  getCharge(loanId: number, chargeId: number) {
    return this.http.get<LoanCharge>(`${this.baseUrl}/${loanId}/charges/${chargeId}`);
  }

  // get charge by external ID
  getChargeByExternalId(loanExternalId: string, loanChargeExternalId: string) {
    return this.http.get<LoanCharge>(
      `${this.baseUrl}/external-id/${loanExternalId}/charges/external-id/${loanChargeExternalId}`
    );
  }

  // delete charge by external ID
  async deleteChargeByExternalId(loanExternalId: string, loanChargeExternalId: string) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.delete(
          `${this.baseUrl}/external-id/${loanExternalId}/charges/external-id/${loanChargeExternalId}`
        )
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete loan charge by external ID'));
    } finally {
      this.loading.set(false);
    }
  }

  // ACTIONS
  async payCharge(loanId: number, chargeId: number, data: PayLoanChargeDto) {
    this.loading.set(true);

    try {
      const payload = {
        ...data,
        dateFormat: data.dateFormat || 'yyyy-MM-dd',
        locale: data.locale || 'en',
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=pay`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to pay loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  async waiveCharge(loanId: number, chargeId: number, data: WaiveLoanChargeDto = {}) {
    this.loading.set(true);

    try {
      const payload = {
        note: data.note || 'Waived via UI',
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=waive`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to waive loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  async adjustCharge(loanId: number, chargeId: number, data: AdjustLoanChargeDto) {
    this.loading.set(true);

    try {
      const payload = {
        amount: data.amount,
        note: data.note || 'Adjustment via UI',
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=adjustment`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to adjust loan charge'));
    } finally {
      this.loading.set(false);
    }
  }

  // Get template by external loan ID
  getTemplateByExternalId(loanExternalId: string) {
    return this.http.get<LoanChargeTemplate>(
      `${this.baseUrl}/external-id/${loanExternalId}/charges/template`
    );
  }
}