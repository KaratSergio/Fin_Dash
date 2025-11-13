import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import type { GLAccount } from '@domains/accounting/interfaces/gl-account.interface';
import type { GLAccountControls } from '@domains/accounting/interfaces/gl-account-controls.interface';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-gl-accounts-table',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './gl-accounts-table.html',
  styleUrls: ['./gl-accounts-table.scss'],
})
export class GLAccountsTable {
  @Input() accounts: GLAccount[] = [];
  @Input() accountControls: GLAccountControls = {};

  @Output() update = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
