import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";

import { GLAccountsService } from "@domains/accounting/services/glaccounts.service";
import { GLAccount } from "@domains/accounting/interfaces/gl-account.interface";
import { GLAccountCreateDto, GLAccountUpdateDto, } from '@domains/accounting/interfaces/gl-account.dto';
import { FormUtils } from "@core/utils/form";

import { GLAccountsForm } from "../../components/gl-accounts-form/gl-accounts-form";
import { GLAccountsTable } from "../../components/gl-accounts-table/gl-accounts-table";

@Component({
    selector: "app-admin-gl-accounts",
    standalone: true,
    imports: [RouterModule, GLAccountsForm, GLAccountsTable],
    templateUrl: "./gl-accounts.html",
    styleUrls: ["./gl-accounts.scss"],
})
export class GLAccountsPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);
    glService = inject(GLAccountsService);

    accounts = this.glService.accounts;
    loading = this.glService.loading;
    error = signal<string | null>(null);
    typeOptions = signal<{ id: number; value: string }[]>([]);
    usageOptions = signal<{ id: number; value: string }[]>([]);
    tagOptions = signal<{ id: number; value: string }[]>([]);
    parentOptions = signal<{ id: number; value: string }[]>([]);

    // Form for creating a new GL account
    createForm = this.fb.group({
        name: this.utils.requiredText(),
        glCode: this.utils.requiredText(),
        description: this.utils.makeControl(""),
        manualEntriesAllowed: this.utils.makeControl(true),
        type: this.utils.requiredNumberNN(0),
        usage: this.utils.requiredNumberNN(0),
        parentId: this.utils.optionalNumber(),
        tagId: this.utils.optionalNumber(),
    });

    // Controls for editing each account
    accountControls: Record<number, {
        name: FormControl<string>;
        glCode: FormControl<string>;
        description: FormControl<string>;
        manualEntriesAllowed: FormControl<boolean>;
    }> = {};

    // Load accounts initially
    private loadAccounts = effect(() => this.glService.getAllAccounts());

    // Load template data for selects
    private loadTemplates = effect(() => {
        this.glService.getAccountsTemplate().subscribe(template => {
            if (!template) return;

            // account types
            this.typeOptions.set(template.accountTypeOptions.map(t => ({ id: t.id, value: t.value })));

            // usage
            this.usageOptions.set(template.usageOptions.map(u => ({ id: u.id, value: u.value })));

            // tags
            const tags = [
                ...template.allowedAssetsTagOptions ?? [],
                ...template.allowedLiabilitiesTagOptions ?? [],
                ...template.allowedEquityTagOptions ?? [],
                ...template.allowedIncomeTagOptions ?? [],
                ...template.allowedExpensesTagOptions ?? [],
            ];
            this.tagOptions.set(tags.map(t => ({ id: t.id, value: t.name })));

            // Parent Accounts - Consolidating All Header Accounts
            const parents = [
                ...template.assetHeaderAccountOptions ?? [],
                ...template.liabilityHeaderAccountOptions ?? [],
                ...template.equityHeaderAccountOptions ?? [],
                ...template.incomeHeaderAccountOptions ?? [],
                ...template.expenseHeaderAccountOptions ?? [],
            ];
            this.parentOptions.set(parents.map(a => ({ id: a.id, value: a.name })));
        });
    });


    // Sync edit controls with accounts list
    private syncControls = effect(() => {
        const ids = new Set(this.accounts().map(a => a.id));

        // removing unnecessary controls
        for (const id of Object.keys(this.accountControls)) {
            if (!ids.has(Number(id))) delete this.accountControls[Number(id)]
        }

        // sync existing accounts
        this.accounts().forEach((acc) => {
            if (!this.accountControls[acc.id]) {
                this.accountControls[acc.id] = {
                    name: this.utils.requiredText(acc.name),
                    glCode: this.utils.requiredText(acc.glCode),
                    description: this.utils.makeControl(acc.description ?? ""),
                    manualEntriesAllowed: this.utils.makeControl(acc.manualEntriesAllowed ?? true),
                };
            } else {
                const c = this.accountControls[acc.id];
                c.name.setValue(acc.name, { emitEvent: false });
                c.glCode.setValue(acc.glCode, { emitEvent: false });
                c.description.setValue(acc.description ?? "", { emitEvent: false });
                c.manualEntriesAllowed.setValue(acc.manualEntriesAllowed ?? true, { emitEvent: false });
            }
        });
    });

    // Methods
    createAccount() {
        if (this.createForm.invalid) return;

        const dto: GLAccountCreateDto = this.createForm.getRawValue();
        if (!dto.parentId) delete dto.parentId;
        if (!dto.tagId) delete dto.tagId;

        this.glService.createAccount(dto).subscribe({
            next: () => this.createForm.reset({
                name: "", glCode: "", description: "", manualEntriesAllowed: true,
                type: 0, usage: 0, parentId: 0, tagId: 0
            }),
            error: (err) => this.error.set(err.message || "Failed to create account"),
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

        this.glService.updateAccount(id, payload).subscribe({
            error: (err) => this.error.set(err.message || "Failed to update account"),
        });
    }

    deleteAccount(id: number) {
        this.glService.deleteAccount(id).subscribe({
            error: (err) => this.error.set(err.message || "Failed to delete account"),
        });
    }
}
