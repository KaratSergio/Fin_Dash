import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
    selector: "app-gl-accounts-form",
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule,
        MatCheckboxModule,
    ],
    templateUrl: "./gl-accounts-form.html",
    styleUrls: ["./gl-accounts-form.scss"],
})
export class GLAccountsForm {
    @Input() form!: FormGroup;
    @Output() create = new EventEmitter<void>();
}
