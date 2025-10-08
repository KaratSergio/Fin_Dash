import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormUtils } from '@src/core/utils/form';

import { LoanProductsService, LoanProduct } from '@src/domains/loans/services/loan-products.service';

import { LoanProductForm } from '../../components/loan-products/loan-products-form/loan-products-form';
import { LoanProductTable } from '../../components/loan-products/loan-products-table/loan-products-table';
import { LoanProductDetails } from '../../components/loan-products/loan-products-details/loan-products-details';

@Component({
    selector: 'app-loan-products-page',
    standalone: true,
    imports: [RouterModule, LoanProductForm, LoanProductTable, LoanProductDetails],
    templateUrl: './loan-products.html',
    styleUrls: ['./loan-products.scss']
})
export class LoanProductsPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);

    loanProductsService = inject(LoanProductsService);

    loanProducts = this.loanProductsService.loanProducts;
    loading = this.loanProductsService.loading;
    error = signal<string | null>(null);

    selectedProductId = signal<number | null>(null);

    // New product creation form
    createProductForm = this.fb.group({
        name: this.utils.requiredText(),
        shortName: this.utils.requiredText(),
        principal: this.utils.requiredNumber(),
        interestRatePerPeriod: this.utils.requiredNumber(),
        numberOfRepayments: this.utils.requiredNumber(),
    });

    // Product Editing Form
    productForm = this.fb.group({
        name: this.utils.requiredText(),
        principal: this.utils.requiredNumber(),
        interestRatePerPeriod: this.utils.requiredNumber(),
        numberOfRepayments: this.utils.requiredNumber(),
        status: this.fb.control({ value: '', disabled: true }),
    });

    // Automatic data loading
    private loadData = effect(() => {
        this.loanProductsService.getLoanProducts();
    });

    // Create Product
    createProduct() {
        if (this.createProductForm.invalid) return;
        const f = this.createProductForm.value;

        const payload = {
            name: f.name?.trim(),
            shortName: f.shortName?.trim(),
            principal: Number(f.principal),
            interestRatePerPeriod: Number(f.interestRatePerPeriod),
            numberOfRepayments: Number(f.numberOfRepayments),
            locale: 'en',
            dateFormat: 'yyyy-MM-dd',
        };

        this.loanProductsService.createLoanProduct(payload).subscribe({
            next: () => {
                this.createProductForm.reset();
                this.loanProductsService.getLoanProducts();
            },
            error: (err) => this.error.set(err.message || 'Failed to create loan product')
        });
    }

    // Selecting a product to edit
    selectProduct(product: LoanProduct) {
        this.selectedProductId.set(product.id);
        this.productForm.patchValue({
            name: product.name,
            principal: product.principal,
            interestRatePerPeriod: product.interestRatePerPeriod,
            numberOfRepayments: product.numberOfRepayments,
            status: product.status?.value || '',
        });
    }

    // Save changes
    saveProduct() {
        const productId = this.selectedProductId();
        if (!productId || this.productForm.invalid) return;

        const f = this.productForm.value;
        const payload = {
            name: f.name?.trim(),
            principal: Number(f.principal),
            interestRatePerPeriod: Number(f.interestRatePerPeriod),
            numberOfRepayments: Number(f.numberOfRepayments),
        };

        this.loanProductsService.updateLoanProduct(productId, payload).subscribe({
            next: () => console.log('Loan product updated'),
            error: (err) => this.error.set(err.message || 'Failed to update product')
        });
    }

    //  Reset edit 
    cancelEdit() {
        const productId = this.selectedProductId();
        if (!productId) return;

        const product = this.loanProducts().find(p => p.id === productId);
        if (!product) return;

        this.selectProduct(product);
    }
}
