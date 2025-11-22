import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import type { GLAccount } from '@src/domains/accounting/interfaces/gl-accounts/gl-account.interface';
import type { GLAccountControls } from '@src/domains/accounting/interfaces/gl-accounts/gl-account-controls.interface';

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
