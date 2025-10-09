import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-loan-form',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatSelectModule, MatInputModule, MatButtonModule
    ],
    templateUrl: './loans-form.html',
    styleUrls: ['./loans-form.scss']
})
export class LoanForm {
    @Input() form!: FormGroup;
    @Input() clients: { id: number; firstname: string; lastname: string }[] = [];

    @Output() submitForm = new EventEmitter<void>();
}
