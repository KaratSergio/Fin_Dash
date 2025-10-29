import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-loan-products-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './loan-products-form.html',
  styleUrls: ['./loan-products-form.scss'],
})
export class LoanProductForm {
  @Input() form!: FormGroup;
  @Output() submitForm = new EventEmitter<void>();
}
