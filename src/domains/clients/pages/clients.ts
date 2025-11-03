import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';

import { ClientsService } from '@domains/clients/services/clients.service';
import { Client } from '@src/domains/clients/interfaces/client.interface';
import { CreateClientDto, UpdateClientDto } from '@src/domains/clients/interfaces/client.dto';
import { OfficesService } from '@domains/offices/services/offices.service';
import { FormUtils } from '@core/utils/form';

import { ClientForm } from '../components/clients-form/clients-form';
import { ClientTable } from '../components/clients-table/clients-table';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [RouterModule, ClientForm, ClientTable],
  providers: [provideNgxMask()],
  templateUrl: './clients.html',
  styleUrls: ['./clients.scss'],
})
export class ClientsPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);

  clientsService = inject(ClientsService);
  officesService = inject(OfficesService);

  clients = this.clientsService.clients;
  loading = this.clientsService.loading;
  error = signal<string | null>(null);

  /// form for creating a new client
  createClientForm = this.fb.group({
    firstname: this.utils.requiredText(),
    lastname: this.utils.requiredText(),
    mobileNo: this.utils.makeControl(''),
    emailAddress: this.utils.requiredEmail(),
    officeId: this.utils.optionalNumber(),
    externalId: this.utils.makeControl(''),
    legalFormId: this.utils.makeControl(1, []), //! PERSON = 1
  });

  // controls for editing existing clients
  clientControls: Record<
    number,
    {
      firstname: FormControl<string | null>;
      lastname: FormControl<string | null>;
      emailAddress: FormControl<string | null>;
      mobileNo: FormControl<string | null>;
      office: FormControl<number | null>;
    }
  > = {};

  private loadData = effect(() => {
    this.clientsService.refresh();
    this.officesService.refresh();
  });

  private syncControls = effect(() => {
    const list: Client[] = this.clients();
    list.forEach((c) => {
      if (!this.clientControls[c.id]) {
        this.clientControls[c.id] = {
          firstname: new FormControl(c.firstname ?? ''),
          lastname: new FormControl(c.lastname ?? ''),
          emailAddress: new FormControl(c.emailAddress ?? ''),
          mobileNo: new FormControl(c.mobileNo ?? ''),
          office: new FormControl(c.officeId ?? null),
        };
      } else {
        const controls = this.clientControls[c.id];
        controls.firstname.setValue(c.firstname ?? '', { emitEvent: false });
        controls.lastname.setValue(c.lastname ?? '', { emitEvent: false });
        controls.emailAddress.setValue(c.emailAddress ?? '', { emitEvent: false });
        controls.mobileNo.setValue(c.mobileNo ?? '', { emitEvent: false });
        controls.office.setValue(c.officeId ?? null, { emitEvent: false });
      }
    });
  });

  // Methods
  createClient() {
    if (this.createClientForm.invalid) return;
    const f = this.createClientForm.value;
    const payload: CreateClientDto = {
      firstname: f.firstname ?? '',
      lastname: f.lastname ?? '',
      emailAddress: f.emailAddress ?? '',
      mobileNo: f.mobileNo ?? '',
      officeId: Number(f.officeId),
      externalId: f.externalId ?? '',
      legalFormId: Number(f.legalFormId),
      active: true,
      activationDate: new Date().toISOString().split('T')[0],
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
    };
    this.clientsService.createClient(payload)
  }

  updateClient(client: Client) {
    const controls = this.clientControls[client.id];
    if (!controls) return;
    const payload: UpdateClientDto = {
      firstname: controls.firstname.value ?? '',
      lastname: controls.lastname.value ?? '',
      emailAddress: controls.emailAddress.value ?? '',
      mobileNo: controls.mobileNo.value ?? '',
      externalId: client.externalId ?? '',
    };
    this.clientsService.updateClient(client.id, payload)
  }

  transferClient(client: Client) {
    const officeId = this.clientControls[client.id]?.office.value;
    if (!officeId) {
      this.error.set('Please select an office before transfer');
      return;
    }
    this.clientsService.transferClientPropose(client.id, officeId)
  }

  deleteClient(id: number) {
    this.clientsService.deleteClient(id)
  }
}
