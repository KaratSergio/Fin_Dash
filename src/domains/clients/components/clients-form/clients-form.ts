import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Client } from '@src/domains/clients/interfaces/client.interface';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxMaskDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './clients-form.html',
  styleUrls: ['./clients-form.scss'],
})
export class ClientForm {
  @Input() form!: FormGroup;
  @Input() offices: { id: number; name: string }[] = [];

  @Output() create = new EventEmitter<Client>();
}
