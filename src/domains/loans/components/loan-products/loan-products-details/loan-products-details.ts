import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-loan-products-details',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: './loan-products-details.html',
    styleUrls: ['./loan-products-details.scss']
})
export class LoanProductDetails {
    @Input() productForm!: FormGroup;
    @Input() productId!: number;

    @Output() save = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onSubmit() {
        console.log('🔹 onSubmit triggered');
        if (this.productForm.valid) {
            console.log('✅ form valid, emitting save');
            this.save.emit();
        } else {
            console.warn('⚠️ form invalid');
        }
    }
}
