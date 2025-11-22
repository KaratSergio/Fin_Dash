import { RouterModule } from '@angular/router';
import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from '@core/utils/form';

import { GLAccountsService } from '@domains/accounting/services/glaccounts.service';
import type { GLAccountCreateDto, GLAccountUpdateDto } from '@src/domains/accounting/interfaces/gl-accounts/gl-account.dto';
import type { GLAccountControls } from '@src/domains/accounting/interfaces/gl-accounts/gl-account-controls.interface';

import { GLAccountsForm } from '@src/domains/accounting/components/gl-accounts/gl-accounts-form/gl-accounts-form';
import { GLAccountsTable } from '@src/domains/accounting/components/gl-accounts/gl-accounts-table/gl-accounts-table';

@Component({
  selector: 'app-admin-gl-accounts',
  standalone: true,
  imports: [RouterModule, GLAccountsForm, GLAccountsTable],
  templateUrl: './gl-accounts.html',
  styleUrls: ['./gl-accounts.scss'],
})
export class GLAccountsPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);
  private glService = inject(GLAccountsService);

  readonly accounts = this.glService.accounts;
  readonly loading = this.glService.loading;
  readonly template = this.glService.template;

  readonly typeOptions = signal<{ id: number; value: string }[]>([]);
  readonly usageOptions = signal<{ id: number; value: string }[]>([]);
  readonly tagOptions = signal<{ id: number; value: string }[]>([]);
  readonly parentOptions = signal<{ id: number; value: string }[]>([]);

  // Form for creating a new GL account
  createForm = this.fb.group({
    name: this.utils.requiredText(),
    glCode: this.utils.requiredText(),
    description: this.utils.makeControl(''),
    manualEntriesAllowed: this.utils.makeControl(true),
    type: this.utils.requiredNumberNN(0),
    usage: this.utils.requiredNumberNN(0),
    parentId: this.utils.optionalNumber(),
    tagId: this.utils.optionalNumber(),
  });

  // Controls for editing each account
  readonly accountControls: GLAccountControls = {};

  // Load accounts initially
  private loadAccounts = effect(() => {
    const list = this.accounts();
    const ids = new Set(list.map((a) => a.id));

    for (const id of Object.keys(this.accountControls)) {
      if (!ids.has(Number(id))) delete this.accountControls[Number(id)];
    }

    list.forEach((acc) => {
      if (!this.accountControls[acc.id]) {
        this.accountControls[acc.id] = {
          name: this.utils.requiredText(acc.name),
          glCode: this.utils.requiredText(acc.glCode),
          description: this.utils.makeControl(acc.description ?? ''),
          manualEntriesAllowed: this.utils.makeControl(acc.manualEntriesAllowed ?? true),
        };
      } else {
        const c = this.accountControls[acc.id];
        c.name.setValue(acc.name, { emitEvent: false });
        c.glCode.setValue(acc.glCode, { emitEvent: false });
        c.description.setValue(acc.description ?? '', { emitEvent: false });
        c.manualEntriesAllowed.setValue(acc.manualEntriesAllowed ?? true, { emitEvent: false });
      }
    });
  });

  // Load template data for selects
  private loadTemplates = effect(() => {
    const t = this.template();
    if (!t) return;

    this.typeOptions.set(t.accountTypeOptions.map((x) => ({ id: x.id, value: x.value })));
    this.usageOptions.set(t.usageOptions.map((x) => ({ id: x.id, value: x.value })));

    const tags = [
      ...(t.allowedAssetsTagOptions ?? []),
      ...(t.allowedLiabilitiesTagOptions ?? []),
      ...(t.allowedEquityTagOptions ?? []),
      ...(t.allowedIncomeTagOptions ?? []),
      ...(t.allowedExpensesTagOptions ?? []),
    ];
    this.tagOptions.set(tags.map((x) => ({ id: x.id, value: x.name })));

    const parents = [
      ...(t.assetHeaderAccountOptions ?? []),
      ...(t.liabilityHeaderAccountOptions ?? []),
      ...(t.equityHeaderAccountOptions ?? []),
      ...(t.incomeHeaderAccountOptions ?? []),
      ...(t.expenseHeaderAccountOptions ?? []),
    ];
    this.parentOptions.set(parents.map((x) => ({ id: x.id, value: x.name })));
  });

  // Sync edit controls with accounts list
  private syncControls = effect(() => {
    const ids = new Set(this.accounts().map((a) => a.id));

    // removing unnecessary controls
    for (const id of Object.keys(this.accountControls)) {
      if (!ids.has(Number(id))) delete this.accountControls[Number(id)];
    }

    // sync existing accounts
    this.accounts().forEach((acc) => {
      if (!this.accountControls[acc.id]) {
        this.accountControls[acc.id] = {
          name: this.utils.requiredText(acc.name),
          glCode: this.utils.requiredText(acc.glCode),
          description: this.utils.makeControl(acc.description ?? ''),
          manualEntriesAllowed: this.utils.makeControl(acc.manualEntriesAllowed ?? true),
        };
      } else {
        const c = this.accountControls[acc.id];
        c.name.setValue(acc.name, { emitEvent: false });
        c.glCode.setValue(acc.glCode, { emitEvent: false });
        c.description.setValue(acc.description ?? '', { emitEvent: false });
        c.manualEntriesAllowed.setValue(acc.manualEntriesAllowed ?? true, { emitEvent: false });
      }
    });
  });

  // Actions
  createAccount() {
    if (this.createForm.invalid) return;

    const dto: GLAccountCreateDto = this.createForm.getRawValue();
    if (!dto.parentId) delete dto.parentId;
    if (!dto.tagId) delete dto.tagId;

    this.glService.createAccount(dto);

    this.createForm.reset({
      name: '',
      glCode: '',
      description: '',
      manualEntriesAllowed: true,
      type: 0,
      usage: 0,
      parentId: 0,
      tagId: 0,
    });
  }

  updateAccount(id: number) {
    const c = this.accountControls[id];
    if (!c) return;

    const payload: GLAccountUpdateDto = {
      name: c.name.value,
      glCode: c.glCode.value,
      description: c.description.value,
      manualEntriesAllowed: c.manualEntriesAllowed.value,
    };

    this.glService.updateAccount(id, payload)
  }

  deleteAccount(id: number) {
    this.glService.deleteAccount(id)
  }

  // refresh() {
  //   this.glService.refresh();
  // }
}
