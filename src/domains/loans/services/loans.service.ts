import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { Loan } from '../interfaces/loan.interface';
import type { CreateLoanDto, UpdateLoanDto, ApproveLoanDto, DisburseLoanDto, RejectLoanDto } from '../interfaces/dto/loan.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { LOAN_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/loan-messages.const';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/loans';

  readonly loans = signal<Loan[]>([]);
  readonly total = computed(() => this.loans().length);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // automatically re-fetch loans when reload changes
  private loansLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<{ pageItems: Loan[] }>(this.baseUrl).pipe(
          tap((res) => this.loans.set(res.pageItems || [])),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of({ pageItems: [] });
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [] } }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createLoan(data: CreateLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<Loan>(this.baseUrl, data));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateLoan(loanId: number, data: UpdateLoanDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.put<Loan>(`${this.baseUrl}/${loanId}`, data));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteLoan(loanId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${loanId}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
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
      this.notificationService.success(MSG.SUCCESS.APPROVED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.APPROVE);
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
      this.notificationService.success(MSG.SUCCESS.DISBURSED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DISBURSE);
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
      this.notificationService.success(MSG.SUCCESS.REPAID);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.REPAY);
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
      this.notificationService.success(MSG.SUCCESS.REJECTED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.REJECT);
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
      this.notificationService.success(MSG.SUCCESS.UNDO_APPROVAL);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UNDO_APPROVAL);
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