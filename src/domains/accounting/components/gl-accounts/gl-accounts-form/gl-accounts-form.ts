import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { GLAccount } from '@src/domains/accounting/interfaces/gl-accounts/gl-account.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-gl-accounts-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './gl-accounts-form.html',
  styleUrls: ['./gl-accounts-form.scss'],
})
export class GLAccountsForm {
  @Input() form!: FormGroup;

  @Input() typeOptions: { id: number; value: string }[] = [];
  @Input() usageOptions: { id: number; value: string }[] = [];
  @Input() parentOptions: { id: number; value: string }[] = [];
  @Input() tagOptions: { id: number; value: string }[] = [];

  @Output() create = new EventEmitter<GLAccount>();
}
