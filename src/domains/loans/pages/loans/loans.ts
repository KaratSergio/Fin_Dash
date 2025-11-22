import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoansService } from '@domains/loans/services/loans.service';
import { LoanProductsService } from '@domains/loans/services/loan-products.service';
import { ClientsService } from '@domains/clients/services/clients.service';

import { formatDateForApi, parseApiDate, extractId, extractString, FormUtils } from '@core/utils';
import { APP_DEFAULTS } from '@core/constants/app.constants';

import type { LoanProduct } from '@domains/loans/interfaces/loan-product.interface';
import type { Loan } from '@domains/loans/interfaces/loan.interface';
import type { CreateLoanDto, UpdateLoanDto } from '@domains/loans/interfaces/dto/loan.dto';

import { LoanForm } from '../../components/loans/loans-form/loans-form';
import { LoanTable } from '../../components/loans/loans-table/loans-table';
import { LoanDetails } from '../../components/loans/loans-details/loans-details';

@Component({
  selector: 'app-loans-page',
  standalone: true,
  imports: [RouterModule, LoanForm, LoanTable, LoanDetails],
  templateUrl: './loans.html',
  styleUrls: ['./loans.scss'],
})
export class LoansPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);

  loansService = inject(LoansService);
  clientsService = inject(ClientsService);
  loanProductsService = inject(LoanProductsService);

  loans = this.loansService.loans;
  clients = this.clientsService.clients;
  loanProducts = computed(() => this.loanProductsService.loanProducts());
  loading = this.loansService.loading;

  selectedLoanId = signal<number | null>(null);
  selectedLoanProduct = signal<LoanProduct | null>(null);

  // Forms
  loanCreateForm = this.fb.group({
    clientId: this.utils.requiredNumber(),
    productId: this.utils.requiredNumber(),
    principal: this.utils.requiredNumber(),
    expectedDisbursementDate: this.utils.requiredText(new Date().toISOString().split('T')[0]),
    loanTermFrequency: this.fb.control(12),
    loanTermFrequencyType: this.fb.control(2),
    numberOfRepayments: this.fb.control(12),
    repaymentEvery: this.fb.control(1),
    repaymentFrequencyType: this.fb.control(2),
    interestType: this.fb.control(0),
    interestCalculationPeriodType: this.fb.control(1),
    amortizationType: this.fb.control(1),
    interestRatePerPeriod: this.fb.control(5),
    transactionProcessingStrategyCode: this.fb.control(APP_DEFAULTS.STRATEGY),
    loanType: this.fb.control('individual'),
    dateFormat: this.fb.control(APP_DEFAULTS.DATE_FORMAT),
    locale: this.fb.control(APP_DEFAULTS.LOCALE),
  });

  loanDetailsForm = this.fb.group({
    principal: this.utils.requiredNumber(),
    timeline: this.fb.group({
      expectedDisbursementDate: this.utils.requiredDate(),
    }),
    status: this.fb.control({ value: '', disabled: true }),
  });

  // Initial data
  private loadData = effect(() => {
    this.loansService.refresh();
    this.clientsService.refresh();
    this.loanProductsService.refresh();
  });

  // Loan selection / form population
  private selectLoan(loan: Loan) {
    this.selectedLoanId.set(loan.id);
    this.populateLoanDetailsForm(loan);
  }

  private populateLoanDetailsForm(loan: Loan) {
    const expectedDate = parseApiDate(loan.timeline?.expectedDisbursementDate);
    this.loanDetailsForm.patchValue({
      principal: loan.principal ?? null,
      timeline: { expectedDisbursementDate: expectedDate },
      status: loan.status?.value ?? '',
    });
  }

  // open/close loan detail form
  toggleLoan(loan: Loan) {
    if (this.selectedLoanId() === loan.id) this.selectedLoanId.set(null);
    else this.selectLoan(loan);
  }

  // reset form when editing
  cancelEdit() {
    const loan = this.loans().find((l) => l.id === this.selectedLoanId());
    if (loan) this.toggleLoan(loan);
  }

  // Create loan
  createLoan() {
    if (this.loanCreateForm.invalid) return;

    const f = this.loanCreateForm.value;
    const product = this.selectedLoanProduct();
    if (!product) return;

    const expectedDate = formatDateForApi(f.expectedDisbursementDate!);
    const principal = f.principal ?? product.principal ?? 0;

    const dto: CreateLoanDto = {
      loanType: 'individual',
      clientId: f.clientId!,
      productId: product.id,
      principal,
      loanTermFrequency: product.numberOfRepayments ?? 1,
      loanTermFrequencyType: product.loanTermFrequencyType ?? 2,
      numberOfRepayments: product.numberOfRepayments ?? 1,
      repaymentEvery: product.repaymentEvery ?? 1,
      repaymentFrequencyType: extractId(product.repaymentFrequencyType, 2),
      interestRatePerPeriod: product.interestRatePerPeriod ?? 1,
      interestType: extractId(product.interestType, 0),
      interestCalculationPeriodType: extractId(product.interestCalculationPeriodType, 1),
      amortizationType: extractId(product.amortizationType, 1),
      transactionProcessingStrategyCode:
        product.transactionProcessingStrategyCode ?? APP_DEFAULTS.STRATEGY,
      expectedDisbursementDate: expectedDate,
      submittedOnDate: expectedDate,
      maxOutstandingLoanBalance: 1,
      disbursementData: [{ expectedDisbursementDate: expectedDate, principal }],
      dateFormat: APP_DEFAULTS.DATE_FORMAT,
      locale: APP_DEFAULTS.LOCALE,
    };

    this.loansService.createLoan(dto)
  }

  // Update loan
  updateLoan() {
    const loanId = this.selectedLoanId();
    if (!loanId) return;

    const f = this.loanDetailsForm.value;
    const loan = this.loans().find((l) => l.id === loanId);
    if (!loan) return;

    const expectedDate = formatDateForApi(f.timeline!.expectedDisbursementDate!);
    const principal = f.principal ?? loan.principal ?? 0;

    const dto: UpdateLoanDto = {
      clientId: loan.clientId,
      productId: loan.loanProductId,
      principal,
      expectedDisbursementDate: expectedDate,
      submittedOnDate: expectedDate,
      loanType: extractString(loan.loanType, '').toLowerCase(),
      loanTermFrequency: loan.loanTermFrequency,
      loanTermFrequencyType: loan.loanTermFrequencyType,
      numberOfRepayments: loan.numberOfRepayments,
      repaymentEvery: loan.repaymentEvery,
      repaymentFrequencyType: extractId(loan.repaymentFrequencyType, 1),
      interestType: extractId(loan.interestType, 0),
      interestCalculationPeriodType: extractId(loan.interestCalculationPeriodType, 1),
      amortizationType: extractId(loan.amortizationType, 1),
      interestRatePerPeriod: loan.interestRatePerPeriod,
      transactionProcessingStrategyCode:
        loan.transactionProcessingStrategyCode ?? APP_DEFAULTS.STRATEGY,
      disbursementData: [
        {
          expectedDisbursementDate: expectedDate,
          principal,
          dateFormat: APP_DEFAULTS.DATE_FORMAT,
          locale: APP_DEFAULTS.LOCALE,
        },
      ],
      dateFormat: APP_DEFAULTS.DATE_FORMAT,
      locale: APP_DEFAULTS.LOCALE,
    };

    this.loansService.updateLoan(loanId, dto)
  }

  // Delete loan
  deleteLoan(id: number) {
    this.loansService.deleteLoan(id)
  }

  // pull up the loan product fields when creating a loan
  onSelectLoanProduct(productId: number) {
    const product = this.loanProducts().find((p) => p.id === productId);
    if (!product) return;

    this.selectedLoanProduct.set(product);

    this.loanCreateForm.patchValue({
      productId: product.id,
      principal: product.principal ?? this.loanCreateForm.value.principal,
      loanTermFrequency: product.numberOfRepayments ?? 12,
      loanTermFrequencyType: product.loanTermFrequencyType ?? 2,
      numberOfRepayments: product.numberOfRepayments ?? 12,
      repaymentEvery: product.repaymentEvery ?? 1,
      repaymentFrequencyType: product.repaymentFrequencyType ?? 2,
      interestType: product.interestType ?? 0,
      interestCalculationPeriodType: product.interestCalculationPeriodType ?? 1,
      amortizationType: product.amortizationType ?? 1,
      interestRatePerPeriod: product.interestRatePerPeriod ?? 5,
      transactionProcessingStrategyCode:
        product.transactionProcessingStrategyCode ?? APP_DEFAULTS.STRATEGY,
    });
  }
}
