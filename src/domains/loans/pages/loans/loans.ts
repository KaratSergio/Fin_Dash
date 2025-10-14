import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoansService, Loan } from '@domains/loans/services/loans.service';
import { LoanProductsService, LoanProduct } from '@domains/loans/services/loan-products.service';
import { ClientsService } from '@domains/clients/services/clients.service';

import { FormUtils } from '@core/utils/form';
import { formatDateForApi } from '@core/utils/date';

import { LoanForm } from '../../components/loans/loans-form/loans-form';
import { LoanTable } from '../../components/loans/loans-table/loans-table';
import { LoanDetails } from '../../components/loans/loans-details/loans-details';

@Component({
    selector: 'app-loans-page',
    standalone: true,
    imports: [RouterModule, LoanForm, LoanTable, LoanDetails],
    templateUrl: './loans.html',
    styleUrls: ['./loans.scss']
})
export class LoansPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);

    loansService = inject(LoansService);
    clientsService = inject(ClientsService);
    loanProductsService = inject(LoanProductsService);

    loans = this.loansService.loans;
    clients = this.clientsService.clients;
    loading = this.loansService.loading;
    error = signal<string | null>(null);

    selectedLoanId = signal<number | null>(null);
    selectedLoanProduct = signal<LoanProduct | null>(null);

    loanProducts = computed(() => this.loanProductsService.loanProducts());

    createLoanForm = this.fb.group({
        clientId: this.utils.requiredNumber(),
        productId: this.utils.requiredNumber(),
        principal: this.utils.requiredNumber(),
        expectedDisbursementDate: this.utils.requiredText(new Date().toISOString().split('T')[0]),

        // mandatory numeric parameters always requires them
        loanTermFrequency: this.fb.control(12),          // loan term
        loanTermFrequencyType: this.fb.control(2),       // 2 = Months
        numberOfRepayments: this.fb.control(12),
        repaymentEvery: this.fb.control(1),
        repaymentFrequencyType: this.fb.control(2),      // 2 = Monthly
        interestType: this.fb.control(0),                // 0 = Declining balance
        interestCalculationPeriodType: this.fb.control(1), // 1 = Same as repayment period
        amortizationType: this.fb.control(1),            // 1 = Equal principal payments
        interestRatePerPeriod: this.fb.control(5),
        transactionProcessingStrategyCode: this.fb.control('mifos-standard-strategy'),

        loanType: this.fb.control('individual'),
        dateFormat: this.fb.control('dd MMMM yyyy'),
        locale: this.fb.control('en')
    });

    // Loan details form
    loanDetailsForm = this.fb.group({
        principal: this.utils.requiredNumber(),
        timeline: this.fb.group({
            expectedDisbursementDate: this.utils.requiredDate(),
        }),
        status: this.fb.control({ value: '', disabled: true })
    });

    // Loan init data
    private loadData = effect(() => {
        this.loansService.getLoans();
        this.clientsService.getClients();
        this.loanProductsService.getLoanProducts();
    });

    createLoan() {
        if (this.createLoanForm.invalid) return;

        const f = this.createLoanForm.value;
        const product = this.selectedLoanProduct();

        if (!product) {
            this.error.set('Loan product not selected');
            return;
        }

        const payload = {
            dateFormat: 'dd MMMM yyyy',
            locale: 'en',
            loanType: 'individual',
            clientId: f.clientId!,
            productId: product.id,
            principal: f.principal ?? product.principal ?? 0,
            loanTermFrequency: product.numberOfRepayments ?? 1,
            loanTermFrequencyType: product.loanTermFrequencyType ?? 2,
            numberOfRepayments: product.numberOfRepayments ?? 1,
            repaymentEvery: product.repaymentEvery ?? 1,
            repaymentFrequencyType:
                (product.repaymentFrequencyType as any)?.id ?? product.repaymentFrequencyType ?? 2,
            interestRatePerPeriod: product.interestRatePerPeriod ?? 1,
            interestType:
                (product.interestType as any)?.id ?? product.interestType ?? 0,
            interestCalculationPeriodType:
                (product.interestCalculationPeriodType as any)?.id ??
                product.interestCalculationPeriodType ??
                1,
            amortizationType:
                (product.amortizationType as any)?.id ?? product.amortizationType ?? 1,
            transactionProcessingStrategyCode:
                product.transactionProcessingStrategyCode ?? 'mifos-standard-strategy',
            expectedDisbursementDate: formatDateForApi(f.expectedDisbursementDate!),
            submittedOnDate: formatDateForApi(f.expectedDisbursementDate!),
            maxOutstandingLoanBalance: 1,
            disbursementData: [
                {
                    expectedDisbursementDate: formatDateForApi(f.expectedDisbursementDate!),
                    principal: f.principal ?? product.principal ?? 0,
                },
            ],
        };

        this.loansService.createLoan(payload).subscribe({
            next: () => this.createLoanForm.reset(),
            error: err => this.error.set(err.message || 'Failed to create loan'),
        });
    }

    deleteLoan(id: number) {
        this.loansService.deleteLoan(id).subscribe({
            error: err => this.error.set(err.message || 'Failed to delete loan')
        });
    }

    toggleLoan(loan: Loan) {
        if (this.selectedLoanId() === loan.id) {
            this.selectedLoanId.set(null);
            return;
        }

        this.selectedLoanId.set(loan.id);

        // convert to [YYYY,MM,DD] 
        const expectedDate = loan.timeline?.expectedDisbursementDate
            ? new Date(
                loan.timeline.expectedDisbursementDate[0],
                loan.timeline.expectedDisbursementDate[1] - 1,
                loan.timeline.expectedDisbursementDate[2]
            )
            : null;

        this.loanDetailsForm.patchValue({
            principal: loan.principal,
            timeline: { expectedDisbursementDate: expectedDate },
            status: loan.status?.value || ''
        });
    }

    saveLoan() {
        const loanId = this.selectedLoanId();
        if (!loanId) return;

        const f = this.loanDetailsForm.value;
        const loan = this.loans().find(l => l.id === loanId);
        if (!loan) return;

        const expectedDate: Date = f.timeline!.expectedDisbursementDate!;

        // getting id from an object or number
        const getId = (field: any, fallback: number) =>
            typeof field === 'object' && field !== null && 'id' in field
                ? (field as { id: number }).id
                : field ?? fallback;

        // getting code from an object or string
        const getValue = (field: any, fallback: string | number) =>
            field && typeof field === 'object' && 'value' in field ? field.value : field ?? fallback;

        const payload = {
            clientId: loan.clientId,
            productId: loan.loanProductId,
            principal: f.principal ?? loan.principal ?? 0,
            expectedDisbursementDate: formatDateForApi(expectedDate),
            submittedOnDate: formatDateForApi(expectedDate),
            dateFormat: 'dd MMMM yyyy',
            locale: 'en',
            loanType: getValue(loan.loanType, '').toLowerCase(),
            loanTermFrequency: loan.loanTermFrequency,
            loanTermFrequencyType: loan.loanTermFrequencyType,
            numberOfRepayments: loan.numberOfRepayments,
            repaymentEvery: loan.repaymentEvery,
            repaymentFrequencyType: getId(loan.repaymentFrequencyType, 1),
            interestType: getId(loan.interestType, 0),
            interestCalculationPeriodType: getId(loan.interestCalculationPeriodType, 1),
            amortizationType: getId(loan.amortizationType, 1),
            interestRatePerPeriod: loan.interestRatePerPeriod,
            transactionProcessingStrategyCode: loan.transactionProcessingStrategyCode ?? 'mifos-standard-strategy',
            disbursementData: [
                {
                    expectedDisbursementDate: formatDateForApi(expectedDate),
                    principal: f.principal ?? loan.principal ?? 0,
                    dateFormat: 'dd MMMM yyyy',
                    locale: 'en',
                },
            ],
        };

        this.loansService.updateLoan(loanId, payload).subscribe({
            next: () => {

                console.log('updated'); // !

                this.loansService.getLoans();
            },
            error: err => this.error.set(err.message || 'Failed to update loan'),
        });
    }

    cancelEdit() {
        const loanId = this.selectedLoanId();
        if (!loanId) return;

        const loan = this.loans().find(l => l.id === loanId);
        if (!loan) return;

        this.toggleLoan(loan);
    }

    onSelectLoanProduct(productId: number) {
        const product = this.loanProducts().find(p => p.id === productId);
        if (!product) return;

        this.selectedLoanProduct.set(product);

        // patching values ​​from the product, but with fallback to defaults
        this.createLoanForm.patchValue({
            productId: product.id,
            principal: product.principal ?? this.createLoanForm.value.principal,
            loanTermFrequency: product.numberOfRepayments ?? 12,
            loanTermFrequencyType: product.loanTermFrequencyType ?? 2,
            numberOfRepayments: product.numberOfRepayments ?? 12,
            repaymentEvery: product.repaymentEvery ?? 1,
            repaymentFrequencyType: product.repaymentFrequencyType ?? 2,
            interestType: product.interestType ?? 0,
            interestCalculationPeriodType: product.interestCalculationPeriodType ?? 1,
            amortizationType: product.amortizationType ?? 1,
            interestRatePerPeriod: product.interestRatePerPeriod ?? 5,
            transactionProcessingStrategyCode: product.transactionProcessingStrategyCode ?? 'mifos-standard-strategy'
        });
    }
}
