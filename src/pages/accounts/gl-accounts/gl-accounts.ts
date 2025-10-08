import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";

import { GLAccountsService, GLAccount } from "@src/services/accounts/glaccounts.service";
import { FormUtils } from "@src/utils/form";

import { GLAccountsForm } from "./gl-accounts-form/gl-accounts-form";
import { GLAccountsTable } from "./gl-accounts-table/gl-accounts-table";

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

    // Form for creating a new GL account
    createForm = this.fb.group({
        name: this.utils.requiredText(),
        glCode: this.utils.requiredText(),
        description: this.utils.makeControl(""),
        manualEntriesAllowed: this.utils.makeControl(true),
    });

    // Controls for editing each account
    accountControls: Record<
        number,
        {
            name: FormControl<string>;
            glCode: FormControl<string>;
            description: FormControl<string>;
            manualEntriesAllowed: FormControl<boolean>;
        }
    > = {};

    // Load accounts initially
    private loadAccounts = effect(() => this.glService.getAllAccounts());

    // Sync edit controls with accounts list
    private syncControls = effect(() => {
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

        this.glService.createAccount(this.createForm.value).subscribe({
            next: () => this.createForm.reset({ name: "", glCode: "", description: "", manualEntriesAllowed: true }),
            error: (err) => this.error.set(err.message || "Failed to create account"),
        });
    }

    updateAccount(id: number) {
        const c = this.accountControls[id];
        if (!c) return;

        const payload: Partial<GLAccount> = {
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
