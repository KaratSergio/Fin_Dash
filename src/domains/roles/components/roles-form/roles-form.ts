import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-roles-form',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: './roles-form.html',
    styleUrls: ['./roles-form.scss']
})
export class RolesForm {
    @Input() form!: FormGroup;
    @Output() create = new EventEmitter<void>();
}
