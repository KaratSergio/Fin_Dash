import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { GLAccount } from "@src/domains/accounting/services/glaccounts.service";

import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
    selector: "app-gl-accounts-table",
    standalone: true,
    imports: [
        ReactiveFormsModule, MatInputModule,
        MatButtonModule, MatCheckboxModule
    ],
    templateUrl: "./gl-accounts-table.html",
    styleUrls: ["./gl-accounts-table.scss"],
})
export class GLAccountsTable {
    @Input() accounts: GLAccount[] = [];
    @Input() accountControls: Record<
        number,
        {
            name: FormControl<string>;
            glCode: FormControl<string>;
            description: FormControl<string>;
            manualEntriesAllowed: FormControl<boolean>;
        }
    > = {};

    @Output() update = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();
}
