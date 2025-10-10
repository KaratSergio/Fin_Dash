import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { CurrencyOption } from "@domains/currencies/services/currencies.service";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from "@angular/material/select";

@Component({
    selector: 'app-charges-form',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule,
        MatCheckboxModule, MatSelectModule
    ],
    templateUrl: './charges-form.html',
    styleUrls: ['./charges-form.scss']
})
export class ChargesForm {
    @Input() form!: FormGroup;
    @Input() currencies: CurrencyOption[] = [];

    @Output() create = new EventEmitter<void>();
}
