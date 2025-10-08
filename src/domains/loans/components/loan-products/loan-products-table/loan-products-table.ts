import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { LoanProduct } from "@src/domains/loans/services/loan-products.service";

@Component({
    selector: "app-loan-products-table",
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: "./loan-products-table.html",
    styleUrls: ["./loan-products-table.scss"]
})
export class LoanProductTable {
    @Input() loanProducts: LoanProduct[] = [];
    @Input() productControls: Record<number, {
        name: FormControl<string | null>,
        principal: FormControl<number | null>,
        interestRatePerPeriod: FormControl<number | null>
    }> = {};

    @Output() select = new EventEmitter<LoanProduct>();
}
