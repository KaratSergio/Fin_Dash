import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { formatTimeline } from '@core/utils/date';

import type { Loan } from '@domains/loans/interfaces/loan.interface';
import type { LoanControls } from '@domains/loans/interfaces/controls/loan-controls.interface';

@Component({
  selector: 'app-loan-table',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './loans-table.html',
  styleUrls: ['./loans-table.scss'],
})
export class LoanTable {
  @Input() loans: Loan[] = [];
  @Input() loanControls: LoanControls = {};
  @Input() activeLoanId: number | null = null;

  @Output() toggle = new EventEmitter<Loan>();
  @Output() delete = new EventEmitter<number>();

  formatTimeline = formatTimeline;
}
