import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormUtils } from '@core/utils/form';

import { LoanProductsService } from '@domains/loans/services/loan-products.service';
import type { LoanProduct } from '@domains/loans/interfaces/loan-product.interface';
import type { LoanProductCreateDto, LoanProductUpdateDto } from '@domains/loans/interfaces/dto/loan-product.dto';
import { APP_DEFAULTS } from '@core/constants/app.constants';

import { LoanProductForm } from '../../components/loan-products/loan-products-form/loan-products-form';
import { LoanProductTable } from '../../components/loan-products/loan-products-table/loan-products-table';
import { LoanProductDetails } from '../../components/loan-products/loan-products-details/loan-products-details';

@Component({
  selector: 'app-loan-products-page',
  standalone: true,
  imports: [RouterModule, LoanProductForm, LoanProductTable, LoanProductDetails],
  templateUrl: './loan-products.html',
  styleUrls: ['./loan-products.scss'],
})
export class LoanProductsPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);

  loanProductsService = inject(LoanProductsService);

  loanProducts = this.loanProductsService.loanProducts;
  loading = this.loanProductsService.loading;

  selectedProductId = signal<number | null>(null);

  // New product creation form
  createProductForm = this.fb.group({
    name: this.utils.requiredText(),
    shortName: this.utils.requiredText('', 4),
    principal: this.utils.requiredNumber(),
    interestRatePerPeriod: this.utils.requiredNumber(),
    numberOfRepayments: this.utils.requiredNumber(),
    interestType: this.utils.requiredNumber(),
    amortizationType: this.utils.requiredNumber(),
    repaymentFrequencyType: this.utils.requiredNumber(),
  });

  // Product Editing Form
  productForm = this.fb.group({
    name: this.utils.requiredText(),
    shortName: this.utils.requiredText<string>('', 4),
    principal: this.utils.requiredNumber(),
    interestRatePerPeriod: this.utils.requiredNumber(),
    // numberOfRepayments: this.utils.requiredNumber(),
    // interestType: this.utils.requiredNumber(),
    // amortizationType: this.utils.requiredNumber(),
    // repaymentFrequencyType: this.utils.requiredNumber(),
    // status: this.fb.control({ value: '', disabled: true }),
  });

  // Automatic data loading
  private loadData = effect(() => {
    this.loanProductsService.refresh();
  });

  // Create Product
  createProduct() {
    if (this.createProductForm.invalid) return;
    const f = this.createProductForm.value;

    const dto: LoanProductCreateDto = {
      name: f.name?.trim() || '',
      shortName: f.shortName?.trim() || '',
      principal: Number(f.principal),
      interestRatePerPeriod: Number(f.interestRatePerPeriod),
      numberOfRepayments: Number(f.numberOfRepayments),
      interestType: Number(f.interestType),
      amortizationType: Number(f.amortizationType),
      repaymentFrequencyType: Number(f.repaymentFrequencyType),

      currencyCode: 'USD',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      repaymentEvery: 1,
      interestRateFrequencyType: 2, // Per month
      interestCalculationPeriodType: 1, // Same as repayment period
      transactionProcessingStrategyCode: 'mifos-standard-strategy',
      accountingRule: 1, // None (no accounting)
      isInterestRecalculationEnabled: false,
      daysInYearType: 1,
      daysInMonthType: 1,

      locale: APP_DEFAULTS.LOCALE,
      dateFormat: APP_DEFAULTS.DATE_FORMAT_API
    };

    this.loanProductsService.createLoanProduct(dto)
  }

  // Selecting a product to edit
  selectProduct(product: LoanProduct) {
    this.selectedProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      shortName: product.shortName,
      principal: product.principal,
      interestRatePerPeriod: product.interestRatePerPeriod,
      // numberOfRepayments: product.numberOfRepayments,
      // interestType: product.interestType?.id || 0,
      // amortizationType: product.amortizationType?.id || 0,
      // repaymentFrequencyType: product.repaymentFrequencyType?.id || 0,
      // status: product.status || '',
    });
  }

  // Save changes
  saveProduct() {
    const productId = this.selectedProductId();
    if (!productId || this.productForm.invalid) return;

    const f = this.productForm.value;
    const dto: LoanProductUpdateDto = {
      name: f.name?.trim(),
      shortName: f.shortName?.trim(),
      principal: Number(f.principal),
      interestRatePerPeriod: Number(f.interestRatePerPeriod),
      // numberOfRepayments: Number(f.numberOfRepayments),
      // interestType: Number(f.interestType),
      // amortizationType: Number(f.amortizationType),
      // repaymentFrequencyType: Number(f.repaymentFrequencyType),
    };

    this.loanProductsService.updateLoanProduct(productId, dto)
  }

  //  Reset edit
  cancelEdit() {
    const productId = this.selectedProductId();
    if (!productId) return;

    const product = this.loanProducts().find((p) => p.id === productId);
    if (!product) return;

    this.selectProduct(product);
  }

  // Toggle loan product detail
  toggleProduct(product: LoanProduct) {
    if (this.selectedProductId() === product.id) this.selectedProductId.set(null);
    else this.selectProduct(product);
  }
}
