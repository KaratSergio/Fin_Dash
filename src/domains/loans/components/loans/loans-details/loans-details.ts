import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-loan-details',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule,
        MatDatepickerModule, MatNativeDateModule
    ],
    templateUrl: './loans-details.html',
    styleUrls: ['./loans-details.scss']
})
export class LoanDetails {
    @Input() loanDetailsForm!: FormGroup;
    @Input() loanId!: number;

    @Output() update = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
}
