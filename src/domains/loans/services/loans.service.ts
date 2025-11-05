import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import type { Loan } from '../interfaces/loan.interface';
import type { CreateLoanDto, UpdateLoanDto, ApproveLoanDto, DisburseLoanDto, RejectLoanDto } from '../interfaces/dto/loan.dto';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/loans';

  loans = signal<Loan[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // CRUD
  // Get all credit list
  getLoans() {
    this.loading.set(true);
    this.http
      .get<{ pageItems: Loan[] }>(this.baseUrl)
      .pipe(
        tap((res) => this.loans.set(res.pageItems || [])),
        catchError((err) => {
          this.error.set(err.message || 'Failed to load loans');
          return of({ pageItems: [] });
        }),
        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // Get credit by ID
  getLoanById(loanId: number) {
    return this.http.get<Loan>(`${this.baseUrl}/${loanId}`);
  }

  // Create new credit
  createLoan(dto: CreateLoanDto) {
    return this.http.post<Loan>(this.baseUrl, dto).pipe(tap(() => this.getLoans()));
  }

  // Update credit
  updateLoan(loanId: number, dto: UpdateLoanDto) {
    return this.http.put<Loan>(`${this.baseUrl}/${loanId}`, dto).pipe(tap(() => this.getLoans()));
  }

  // Delete credit
  deleteLoan(loanId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${loanId}`).pipe(tap(() => this.getLoans()));
  }

  // ACTION
  // Approve the application
  approveLoan(id: number, dto: ApproveLoanDto) {
    return this.http
      .post(`${this.baseUrl}/${id}?command=approve`, dto)
      .pipe(tap(() => this.getLoans()));
  }

  // Issue a loan (Disburse)
  disburseLoan(id: number, dto: DisburseLoanDto) {
    return this.http
      .post(`${this.baseUrl}/${id}?command=disburse`, dto)
      .pipe(tap(() => this.getLoans()));
  }

  // Make a payment (Repayment)
  repayLoan(loanId: number, transactionDate: string, transactionAmount: number) {
    return this.http.post(`${this.baseUrl}/${loanId}/transactions?command=repayment`, {
      transactionDate,
      transactionAmount,
    });
  }

  // Withdraw / cancel application
  rejectLoan(id: number, dto: RejectLoanDto) {
    return this.http
      .post(`${this.baseUrl}/${id}?command=reject`, dto)
      .pipe(tap(() => this.getLoans()));
  }

  // Download loan template (to fill out form)
  getLoanTemplate(clientId?: number, productId?: number) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', String(clientId));
    if (productId) params.append('productId', String(productId));
    return this.http.get(`${this.baseUrl}/template?${params.toString()}`);
  }

  // Undo loan approval
  undoApproval(id: number) {
    const payload = { note: 'Undo approval via UI' };
    return this.http
      .post(`${this.baseUrl}/${id}?command=undoApproval`, payload)
      .pipe(tap(() => this.getLoans()));
  }
}
