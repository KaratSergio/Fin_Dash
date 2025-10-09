import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { AppUser } from "@domains/users/services/user.service";

@Component({
    selector: "app-users-table",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule, MatSelectModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: "./users-table.html",
    styleUrls: ["./users-table.scss"]
})
export class UsersTable {
    @Input() users: AppUser[] = [];
    @Input() userControls: Record<number, {
        username: FormControl<string | null>;
        firstname: FormControl<string | null>;
        lastname: FormControl<string | null>;
        email: FormControl<string | null>;
        roles: FormControl<number[]>;
        office: FormControl<number | null>;
    }> = {};

    @Input() roles: { id: number; name: string }[] = [];
    @Input() offices: { id: number; name: string }[] = [];

    @Output() update = new EventEmitter<AppUser>();
    @Output() delete = new EventEmitter<number>();
}
