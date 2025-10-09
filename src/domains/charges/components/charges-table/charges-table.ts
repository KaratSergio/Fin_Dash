import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core'
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Charge } from "../../services/charges.service";

@Component({
    selector: 'app-charges-table',
    standalone: true,
    imports: [ReactiveFormsModule, MatInputModule, MatOptionModule, MatCheckboxModule],
    templateUrl: './charges-table.html',
    styleUrls: ['./charges-table.scss']
})
export class ChargesTable {
    @Input() charges: Charge[] = [];
    @Input() chargeControls: Record<number, {
        name: FormControl<string>;
        description: FormControl<string>;
        amount: FormControl<number>;
        currencyCode: FormControl<string>;
        penalty: FormControl<boolean>;
        chargeType: FormControl<'FEE' | 'PENALTY'>;
    }> = {};

    @Output() update = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();
}
