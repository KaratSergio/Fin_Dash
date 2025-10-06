import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-users-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule, MatSelectModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: "./users-form.html",
    styleUrls: ["./users-form.scss"]
})
export class UsersForm {
    @Input() form!: FormGroup;
    @Input() roles: { id: number; name: string }[] = [];
    @Input() offices: { id: number; name: string }[] = [];

    @Output() create = new EventEmitter<void>();
}
