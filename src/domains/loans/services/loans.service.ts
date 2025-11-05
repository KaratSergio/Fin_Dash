import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import type { Loan } from '../interfaces/loan.interface';
import type { CreateLoanDto, UpdateLoanDto, ApproveLoanDto, DisburseLoanDto, RejectLoanDto } from '../interfaces/dto/loan.dto';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/loans';

  readonly loans = signal<Loan[]>([]);
  readonly total = computed(() => this.loans().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // automatically re-fetch loans when reload changes
  private loansLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<{ pageItems: Loan[] }>(this.baseUrl).pipe(
          tap((res) => this.loans.set(res.pageItems || [])),
          catchError((err) => {
            this.error.set(handleError(err, 'Failed to load loans'));
            return of({ pageItems: [] });
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [] } }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[LoansService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createLoan(data: CreateLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<Loan>(this.baseUrl, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateLoan(loanId: number, data: UpdateLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.put<Loan>(`${this.baseUrl}/${loanId}`, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteLoan(loanId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${loanId}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete loan'));
    } finally {
      this.loading.set(false);
    }
  }

  // ACTION Operations
  async approveLoan(id: number, data: ApproveLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${id}?command=approve`, data)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to approve loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async disburseLoan(id: number, data: DisburseLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${id}?command=disburse`, data)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to disburse loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async repayLoan(loanId: number, transactionDate: string, transactionAmount: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${loanId}/transactions?command=repayment`, {
          transactionDate,
          transactionAmount,
        })
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to repay loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async rejectLoan(id: number, data: RejectLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${id}?command=reject`, data)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to reject loan'));
    } finally {
      this.loading.set(false);
    }
  }

  async undoApproval(id: number) {
    this.loading.set(true);

    try {
      const payload = { note: 'Undo approval via UI' };
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${id}?command=undoApproval`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to undo loan approval'));
    } finally {
      this.loading.set(false);
    }
  }

  // get single loan
  getLoanById(loanId: number) {
    return this.http.get<Loan>(`${this.baseUrl}/${loanId}`);
  }

  // get loan template with parameters
  getLoanTemplate(clientId?: number, productId?: number) {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId.toString());
    if (productId) params = params.set('productId', productId.toString());

    return this.http.get(`${this.baseUrl}/template`, { params });
  }
}