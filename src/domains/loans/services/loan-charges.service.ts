import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface LoanCharge {
    id: number;                     // Charge ID
    name: string;                   // Charge name
    chargeTimeType: {               // When charge is applied
        id: number;
        value: string
    };
    chargeCalculationType: {        // How charge is calculated
        id: number;
        value: string
    };
    chargePaymentMode: {            // Payment mode
        id: number;
        value: string
    };
    amount: number;                 // Charge amount
    amountPaid?: number;            // Amount paid (optional)
    amountWaived?: number;          // Amount waived (optional)
    amountOutstanding?: number;     // Remaining amount (optional)
    penalty?: boolean;              // True if penalty
    dueDate?: string;               // Due date (yyyy-MM-dd)
    chargeType?: string;            // Fee or Penalty (optional)
    externalId?: string;            // External ID (optional)
}

export interface LoanChargeTemplate {
    chargeOptions: Array<{
        id: number;
        name: string;
        penalty: boolean;
        chargeAppliesTo: { id: number; value: string };
    }>;
}

// Its typical for MFIs to add extra costs for their loan products.They can be either Fees or Penalties.

// Loan Charges are instances of Charges and represent either fees and penalties for loan products.Refer Charges for documentation of the various properties of a charge, Only additional properties(specific to the context of a Charge being associated with a Loan) are described here

@Injectable({ providedIn: 'root' })
export class LoanChargesService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/v1/loans';

    charges = signal<LoanCharge[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // CRUD
    // List all charges for loan
    getCharges(loanId: number) {
        this.loading.set(true);
        this.http
            .get<LoanCharge[]>(`${this.baseUrl}/${loanId}/charges`)
            .pipe(
                tap((res) => this.charges.set(res || [])),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load loan charges');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            )
            .subscribe();
    }

    // Retrieve a single loan charge
    getChargeById(loanId: number, chargeId: number) {
        return this.http
            .get<LoanCharge>(`${this.baseUrl}/${loanId}/charges/${chargeId}`);
    }

    // Retrieve by external ID
    getChargeByExternalId(loanExternalId: string, loanChargeExternalId: string) {
        return this.http
            .get<LoanCharge>(`${this.baseUrl}/external-id/${loanExternalId}/charges/external-id/${loanChargeExternalId}`);
    }

    // Create a new charge for loan
    createCharge(loanId: number, payload: Partial<LoanCharge>) {
        return this.http
            .post(`${this.baseUrl}/${loanId}/charges`, payload)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // Update existing loan charge
    updateCharge(loanId: number, chargeId: number, payload: Partial<LoanCharge>) {
        return this.http
            .put(`${this.baseUrl}/${loanId}/charges/${chargeId}`, payload)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // Delete a loan charge
    deleteCharge(loanId: number, chargeId: number) {
        return this.http
            .delete(`${this.baseUrl}/${loanId}/charges/${chargeId}`)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // Delete by external ID
    deleteChargeByExternalId(loanExternalId: string, loanChargeExternalId: string) {
        return this.http
            .delete(`${this.baseUrl}/external-id/${loanExternalId}/charges/external-id/${loanChargeExternalId}`);
    }

    // ACTIONS 
    // Pay a specific charge
    payCharge(loanId: number, chargeId: number, amount: number, date: string) {
        const payload = {
            amount,
            dateFormat: 'yyyy-MM-dd',
            locale: 'en',
            paymentDate: date
        };
        return this.http
            .post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=pay`, payload)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // Waive a charge (mark as forgiven)
    waiveCharge(loanId: number, chargeId: number, note?: string) {
        const payload = { note: note || 'Waived via UI' };
        return this.http
            .post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=waive`, payload)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // Make adjustment for charge
    adjustCharge(loanId: number, chargeId: number, amount: number, note?: string) {
        const payload = { amount, note: note || 'Adjustment via UI' };
        return this.http
            .post(`${this.baseUrl}/${loanId}/charges/${chargeId}?command=adjustment`, payload)
            .pipe(tap(() => this.getCharges(loanId)));
    }

    // TEMPLATE
    // Retrieve available charge options
    getChargeTemplate(loanId: number) {
        return this.http
            .get<LoanChargeTemplate>(`${this.baseUrl}/${loanId}/charges/template`);
    }

    // Retrieve template by external loan ID
    getChargeTemplateByExternalId(loanExternalId: string) {
        return this.http
            .get<LoanChargeTemplate>(`${this.baseUrl}/external-id/${loanExternalId}/charges/template`);
    }
}
