import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

// A Loan product is a template that is used when creating a loan.
// Much of the template definition can be overridden during loan creation.
export interface LoanProduct {
    id: number;                          // Loan product ID
    name: string;                        // Name of the loan product
    shortName?: string;                   // Short name (optional)
    description?: string;                 // Description of the loan product (optional)
    principal?: number;                   // Default principal amount (optional)
    interestRatePerPeriod?: number;       // Default interest rate (optional)
    numberOfRepayments?: number;          // Default number of repayments (optional)
    repaymentEvery?: number;              // Default repayment interval (optional)
    interestRateFrequencyType?: number;   // Default interest rate frequency type (optional)
    interestType?: number;                // Default interest type (optional)
    amortizationType?: number;            // Default amortization type (optional)
    currency?: {                           // Currency info (optional)
        code: string;
        name: string;
        decimalPlaces: number;
    };
    accountingRule?: {                     // Accounting rule (optional)
        id: number;
        code: string;
        value: string;
    };
    status?: {                             // Status info (optional)
        id: number;
        code: string;
        value: string;
    };
}

@Injectable({ providedIn: 'root' })
export class LoanProductsService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/loanproducts';

    loanProducts = signal<LoanProduct[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Get loan product list
    getLoanProducts() {
        this.loading.set(true);
        this.http
            .get<{ pageItems: LoanProduct[] } | LoanProduct[]>(this.baseUrl)
            .pipe(
                tap((res: any) => {
                    const items = Array.isArray(res) ? res : res.pageItems || [];
                    this.loanProducts.set(items);
                }),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load loan products');
                    return of({ pageItems: [] });
                }),
                tap(() => this.loading.set(false))
            )
            .subscribe();
    }

    // Get loan product by ID
    getLoanProductById(productId: number) {
        return this.http.get<LoanProduct>(`${this.baseUrl}/${productId}`);
    }

    // Get loan product by externalId
    getLoanProductByExternalId(externalId: string) {
        return this.http.get<LoanProduct>(
            `${this.baseUrl}/external-id/${externalId}`
        );
    }

    // Create loan product
    createLoanProduct(payload: Partial<LoanProduct>) {
        return this.http.post<LoanProduct>(this.baseUrl, payload).pipe(
            tap(() => this.getLoanProducts())
        );
    }

    // Update loan product
    updateLoanProduct(productId: number, payload: Partial<LoanProduct>) {
        return this.http.put<LoanProduct>(`${this.baseUrl}/${productId}`, payload).pipe(
            tap(() => this.getLoanProducts())
        );
    }

    // Update loan product by externalId
    updateLoanProductByExternalId(externalId: string, payload: Partial<LoanProduct>) {
        return this.http.put<LoanProduct>(`${this.baseUrl}/external-id/${externalId}`, payload).pipe(
            tap(() => this.getLoanProducts())
        );
    }

    // get template
    getLoanProductTemplate() {
        return this.http.get(`${this.baseUrl}/template`);
    }
}
