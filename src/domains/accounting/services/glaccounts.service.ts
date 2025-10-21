import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { GLAccount } from '../interfaces/gl-account.interface';
import {
    GLAccountCreateDto, GLAccountUpdateDto,
    GLAccountsTemplateResponseDto,
} from '../interfaces/gl-account.dto';

// Ledger accounts represent an Individual account within an Organizations Chart Of Accounts(COA)
//  and are assigned a name and unique number by which they can be identified.
//  All transactions relating to a company's assets, liabilities, owners' equity,
//  revenue and expenses are recorded against these accounts.


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
            ).subscribe();
    }

    // CRUD
    // Retrieve GL Accounts Template
    // Provides reference data for creating a new account
    getAccountsTemplate() {
        return this.http
            .get<GLAccountsTemplateResponseDto>(`${this.baseUrl}/template`)
            .pipe(
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load GL accounts template');
                    return of(null);
                })
            );
    }

    // Create a new General Ledger Account
    createAccount(payload: GLAccountCreateDto) {
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
    updateAccount(id: number, payload: GLAccountUpdateDto) {
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
