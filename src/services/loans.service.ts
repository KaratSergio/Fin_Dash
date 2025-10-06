import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface Loan {
    id: number;
    accountNo: string;
    clientId: number;
    clientName?: string;
    loanProductId: number;
    loanProductName?: string;
    principal: number;
    interestRatePerPeriod: number;
    numberOfRepayments: number;
    loanTermFrequency: number;
    loanTermFrequencyType: number;
    repaymentEvery: number;
    repaymentFrequencyType: number;
    interestRateFrequencyType: number;
    interestType: number;
    amortizationType: number;
    status?: { id: number; code: string; value: string };
    submittedOnDate?: string;
    approvedOnDate?: string;
    expectedDisbursementDate?: string;
}

@Injectable({ providedIn: 'root' })
export class LoansService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/loans';

    loans = signal<Loan[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);


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
                tap(() => this.loading.set(false))
            )
            .subscribe();
    }

    // Get credit by ID
    getLoanById(loanId: number) {
        return this.http.get<Loan>(`${this.baseUrl}/${loanId}`);
    }

    // Create new credit
    createLoan(payload: Partial<Loan>) {
        return this.http.post<Loan>(this.baseUrl, payload).pipe(
            tap(() => this.getLoans())
        );
    }

    // Update credit
    updateLoan(loanId: number, payload: Partial<Loan>) {
        return this.http.put<Loan>(`${this.baseUrl}/${loanId}`, payload).pipe(
            tap(() => this.getLoans())
        );
    }

    // Delete credit
    deleteLoan(loanId: number) {
        return this.http.delete<void>(`${this.baseUrl}/${loanId}`).pipe(
            tap(() => this.getLoans())
        );
    }

    // === COMMANDS ===

    // Approve the application
    approveLoan(id: number, approvedOnDate: string) {
        const payload = {
            approvedOnDate,
            dateFormat: 'yyyy-MM-dd',
            locale: 'en',
            note: 'Approved via UI',
            approvedLoanAmount: 0 // !!!
        };
        return this.http.post(`${this.baseUrl}/${id}?command=approve`, payload).pipe(
            tap(() => this.getLoans())
        );
    }

    // Issue a loan (Disburse)
    disburseLoan(id: number, disbursedOnDate: string) {
        const payload = {
            actualDisbursementDate: disbursedOnDate,
            dateFormat: 'yyyy-MM-dd',
            locale: 'en',
            note: 'Disbursed via UI'
        };
        return this.http.post(`${this.baseUrl}/${id}?command=disburse`, payload).pipe(
            tap(() => this.getLoans())
        );
    }

    // Make a payment (Repayment)
    repayLoan(loanId: number, transactionDate: string, transactionAmount: number) {
        return this.http.post(`${this.baseUrl}/${loanId}/transactions?command=repayment`, {
            transactionDate,
            transactionAmount
        });
    }

    // Withdraw / cancel application
    rejectLoan(id: number, rejectedOnDate: string) {
        const payload = {
            rejectedOnDate,
            dateFormat: 'yyyy-MM-dd',
            locale: 'en',
            note: 'Rejected via UI'
        };
        return this.http.post(`${this.baseUrl}/${id}?command=reject`, payload).pipe(
            tap(() => this.getLoans())
        );
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
        return this.http.post(`${this.baseUrl}/${id}?command=undoApproval`, payload).pipe(
            tap(() => this.getLoans())
        );
    }
}
