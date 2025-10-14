import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface LoanTimeline {
    submittedOnDate: [number, number, number]; // [YYYY, MM, DD]
    actualMaturityDate: [number, number, number];
    expectedDisbursementDate: [number, number, number];
    expectedMaturityDate: [number, number, number];
    submittedByFirstname: string;
    submittedByLastname: string;
    submittedByUsername: string;
}


export interface Loan {
    id: number;                          // Loan ID
    loanType: string;
    interestCalculationPeriodType?: number;
    transactionProcessingStrategyCode?: string;
    graceOnPrincipalPayment: number;
    graceOnInterestPayment: number;
    graceOnInterestCharged: number;
    maxOutstandingLoanBalance: number;
    fixedEmiAmount: number;
    disbursementData?: {
        expectedDisbursementDate: string;
        principal: number;
    }[];
    accountNo: string;                   // Loan account number
    clientId: number;                    // ID of the client who owns the loan
    clientName?: string;                 // Name of the client (optional)
    productId: number;                   // ID of the loan product
    loanProductId: number;
    loanProductName?: string;            // Name of the loan product (optional)
    principal: number;                   // Principal amount
    interestRatePerPeriod: number;       // Interest rate per period
    numberOfRepayments: number;          // Total number of repayments
    loanTermFrequency: number;           // Loan term frequency (number)
    loanTermFrequencyType: number;       // Loan term frequency type (enum)
    repaymentEvery: number;              // Repayment interval
    repaymentFrequencyType: number;      // Repayment frequency type (enum)
    interestRateFrequencyType: number;   // Interest rate frequency type (enum)
    interestType: number;                // Type of interest (enum)
    amortizationType: number;            // Amortization type (enum)
    status?: {                            // Current status of the loan (optional)
        id: number;
        code: string;
        value: string;
    };
    submittedOnDate?: string;            // Date when loan was submitted (yyyy-MM-dd) (optional)
    approvedOnDate?: string;             // Date when loan was approved (yyyy-MM-dd) (optional)
    locale: string;
    dateFormat: string;
    timeline?: LoanTimeline;
    expectedDisbursementDate: string;
}

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

    // ACTION
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
