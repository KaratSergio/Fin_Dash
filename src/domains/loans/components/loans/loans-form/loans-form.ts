import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { LoanProduct } from '@domains/loans/interfaces/loan-product.interface';

@Component({
    selector: 'app-loan-form',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatDatepickerModule, MatNativeDateModule,
        MatSelectModule, MatInputModule, MatButtonModule
    ],
    templateUrl: './loans-form.html',
    styleUrls: ['./loans-form.scss']
})
export class LoanForm {
    @Input() form!: FormGroup;
    @Input() products: LoanProduct[] = [];
    @Input() clients: { id: number; firstname: string; lastname: string }[] = [];

    @Output() submitForm = new EventEmitter<FormGroup>();
    @Output() productSelected = new EventEmitter<LoanProduct>();

    onProductSelect(productId: number) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.form.patchValue({
            productId: product.id,
            principal: product.principal ?? this.form.value.principal,
            loanType: 'individual',
            loanTermFrequency: product.numberOfRepayments,
            loanTermFrequencyType: product.loanTermFrequencyType,
            numberOfRepayments: product.numberOfRepayments,
            repaymentEvery: product.repaymentEvery,
            repaymentFrequencyType: product.repaymentFrequencyType,
            interestType: product.interestType,
            interestCalculationPeriodType: product.interestCalculationPeriodType,
            amortizationType: product.amortizationType,
            transactionProcessingStrategyCode: product.transactionProcessingStrategyCode,
            interestRatePerPeriod: product.interestRatePerPeriod,
        });

        this.productSelected.emit(product);
    }
}
