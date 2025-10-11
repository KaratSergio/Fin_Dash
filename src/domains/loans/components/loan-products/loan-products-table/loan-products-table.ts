import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { LoanProduct } from "@domains/loans/services/loan-products.service";

@Component({
    selector: "app-loan-products-table",
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: "./loan-products-table.html",
    styleUrls: ["./loan-products-table.scss"]
})
export class LoanProductTable {
    @Input() loanProducts: LoanProduct[] = [];
    @Input() activeProductId: number | null = null;

    @Output() toggle = new EventEmitter<LoanProduct>();

    // transformation to display some fields on the screen
    displayOption(option: { id: number; code: string; value: string } | number | undefined): string {
        if (option == null) return '';
        if (typeof option === 'number') return `Type ${option}`;
        return option.value;
    }

}
