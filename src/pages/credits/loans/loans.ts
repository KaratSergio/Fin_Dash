import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoansService, Loan } from '@src/services/credits/loans.service';
import { ClientsService } from '@src/services/clients.service';
import { FormUtils } from '@src/utils/form';

import { LoanForm } from './loans-form/loans-form';
import { LoanTable } from './loans-table/loans-table';
import { LoanDetails } from './loans-details/loans-details';

@Component({
    selector: 'app-loans-page',
    standalone: true,
    imports: [
        RouterModule, LoanForm,
        LoanTable, LoanDetails
    ],
    templateUrl: './loans.html',
    styleUrls: ['./loans.scss']
})
export class LoansPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);

    loansService = inject(LoansService);
    clientsService = inject(ClientsService);

    loans = this.loansService.loans;
    clients = this.clientsService.clients;
    loading = this.loansService.loading;
    error = signal<string | null>(null);

    selectedLoanId = signal<number | null>(null);

    // Form for creating a new loan
    createLoanForm = this.fb.group({
        clientId: this.utils.requiredNumber(),
        loanProductId: this.utils.requiredNumber(),
        principal: this.utils.requiredNumber(),
        expectedDisbursementDate: this.utils.requiredDate()
    });

    // Form for details of the selected loan
    loanForm = this.fb.group({
        principal: this.utils.requiredNumber(),
        expectedDisbursementDate: this.utils.requiredDate(),
        status: this.fb.control({ value: '', disabled: true })
    });

    private loadData = effect(() => {
        this.loansService.getLoans();
        this.clientsService.getClients();
    });

    // Creating a new loan
    createLoan() {
        if (this.createLoanForm.invalid) return;
        const f = this.createLoanForm.value;

        const payload = {
            clientId: Number(f.clientId),
            productId: Number(f.loanProductId),
            principal: Number(f.principal),
            expectedDisbursementDate: f.expectedDisbursementDate || undefined,
            dateFormat: 'yyyy-MM-dd',
            locale: 'en',
            submittedOnDate: new Date().toISOString().split('T')[0],
        };

        this.loansService.createLoan(payload).subscribe({
            next: () => this.createLoanForm.reset(),
            error: err => this.error.set(err.message || 'Failed to create loan')
        });
    }

    // Deleting a loan
    deleteLoan(id: number) {
        this.loansService.deleteLoan(id).subscribe({
            error: err => this.error.set(err.message || 'Failed to delete loan')
        });
    }

    // Selecting a loan for editing
    selectLoan(loan: Loan) {
        this.selectedLoanId.set(loan.id);
        this.loanForm.patchValue({
            principal: loan.principal,
            expectedDisbursementDate: loan.expectedDisbursementDate,
            status: loan.status?.value || ''
        });
    }

    // Saving changes to a loan
    saveLoan() {
        const loanId = this.selectedLoanId();
        if (!loanId) return;

        const f = this.loanForm.value;
        const payload = {
            principal: f.principal ?? undefined,
            expectedDisbursementDate: f.expectedDisbursementDate ?? undefined,
            // status: f.status ?? undefined
        };

        this.loansService.updateLoan(loanId, payload).subscribe({
            next: () => console.log('Loan updated'),
            error: err => this.error.set(err.message || 'Failed to update loan')
        });
    }

    // Cancel Edit
    cancelEdit() {
        const loanId = this.selectedLoanId();
        if (!loanId) return;

        const loan = this.loans().find(l => l.id === loanId);
        if (!loan) return;

        this.selectLoan(loan);
    }

}
