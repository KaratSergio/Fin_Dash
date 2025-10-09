import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

// Ledger accounts represent an Individual account within an Organizations Chart Of Accounts(COA)
//  and are assigned a name and unique number by which they can be identified.
//  All transactions relating to a company's assets, liabilities, owners' equity,
//  revenue and expenses are recorded against these accounts.
export interface GLAccount {
    id: number;                         // Unique account ID
    name: string;                       // Account name
    glCode: string;                     // General Ledger code
    disabled: boolean;                  // Whether the account is disabled
    manualEntriesAllowed: boolean;      // Whether manual journal entries are allowed
    type: {                             // Account type (e.g., ASSET, LIABILITY)
        id: number;
        code: string;
        value: string;
    };
    usage: {                            // Usage type (e.g., HEADER or DETAIL)
        id: number;
        code: string;
        value: string;
    };
    tagId?: number;                     // Optional tag identifier
    parentId?: number;                  // Optional parent account ID
    description?: string;               // Optional account description
    organizationRunningBalance?: number;// Running balance for the organization
}


// Represents the template data for creating GL Accounts
// (used to populate dropdowns or default values)
export interface GLAccountsTemplateResponse {
    assetHeaderAccountOptions: GLAccount[];     // Asset accounts
    liabilityHeaderAccountOptions: GLAccount[]; // Liability accounts
    equityHeaderAccountOptions: GLAccount[];    // Equity accounts
    incomeHeaderAccountOptions: GLAccount[];    // Income accounts
    expenseHeaderAccountOptions: GLAccount[];   // Expense accounts
}

@Injectable({ providedIn: 'root' })
export class GLAccountsService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/glaccounts';

    accounts = signal<GLAccount[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Fetch all General Ledger Accounts
    getAllAccounts() {
        this.loading.set(true);

        this.http
            .get<GLAccount[]>(this.baseUrl)
            .pipe(
                tap((res) => {
                    this.accounts.set(res || []);
                }),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load GL accounts');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            )
            .subscribe();
    }


    // Retrieve GL Accounts Template
    // Provides reference data for creating a new account
    getAccountsTemplate() {
        return this.http
            .get<GLAccountsTemplateResponse>(`${this.baseUrl}/template`)
            .pipe(
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load GL accounts template');
                    return of(null);
                })
            );
    }

    // Create a new General Ledger Account
    createAccount(payload: Partial<GLAccount>) {
        return this.http
            .post(this.baseUrl, payload)
            .pipe(tap(() => this.getAllAccounts()),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to create GL account');
                    return of(null);
                })
            );
    }


    // Update an existing General Ledger Account
    updateAccount(id: number, payload: Partial<GLAccount>) {
        return this.http
            .put(`${this.baseUrl}/${id}`, payload)
            .pipe(tap(() => this.getAllAccounts()),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to update GL account');
                    return of(null);
                })
            );
    }

    // Delete a General Ledger Account
    deleteAccount(id: number) {
        return this.http
            .delete(`${this.baseUrl}/${id}`)
            .pipe(tap(() => this.getAllAccounts()),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to delete GL account');
                    return of(null);
                })
            );
    }
}
