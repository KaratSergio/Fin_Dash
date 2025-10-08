import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Loan } from "@src/domains/loans/services/loans.service";

@Component({
    selector: "app-loan-table",
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: "./loans-table.html",
    styleUrls: ["./loans-table.scss"]
})
export class LoanTable {
    @Input() loans: Loan[] = [];
    @Input() loanControls: Record<number, {
        principal: FormControl<number | null>,
        expectedDisbursementDate: FormControl<string | null>,
        status: FormControl<string | null>
    }> = {};

    @Output() update = new EventEmitter<Loan>();
    @Output() select = new EventEmitter<Loan>();
    @Output() delete = new EventEmitter<number>();
}
