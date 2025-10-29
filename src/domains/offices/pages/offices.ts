import { Component, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { OfficesService } from '@domains/offices/services/offices.service';
import { CreateOfficeDto, UpdateOfficeDto } from '@domains/offices/interfaces/office.dto';
import { Office } from '@domains/offices/interfaces/office.interface';
import { FormUtils } from '@core/utils/form';
import { APP_DEFAULTS } from '@core/constants/app.constants';

import { OfficesForm } from '../components/offices-form/offices-form';
import { OfficesTable } from '../components/offices-table/offices-table';

@Component({
  selector: 'app-admin-offices',
  standalone: true,
  imports: [RouterModule, OfficesForm, OfficesTable],
  templateUrl: './offices.html',
  styleUrls: ['./offices.scss'],
})
export class OfficesAdminPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);
  officesService = inject(OfficesService);

  offices = this.officesService.offices;
  loading = this.officesService.loading;
  error = signal<string | null>(null);

  // Form for creating office
  createOfficeForm = this.fb.group({
    name: this.utils.requiredText(),
    externalId: this.utils.makeControl(''),
    parentId: this.utils.requiredNumberNN(1),
    openingDate: this.utils.requiredText(new Date().toISOString().split('T')[0]),
    locale: this.utils.makeControl(APP_DEFAULTS.LOCALE),
    dateFormat: this.utils.makeControl(APP_DEFAULTS.DATE_FORMAT),
  });

  // Controls for editing existing offices
  officeControls: Record<
    number,
    {
      name: FormControl<string>;
      externalId: FormControl<string>;
      parentId: FormControl<number | null>;
      openingDate: FormControl<string>;
    }
  > = {};

  // Load offices initially
  private loadOffices = effect(() => {
    this.officesService.getOffices({
      fields: 'id,externalId,name,openingDate,parentId',
      orderBy: 'name',
      sortOrder: 'ASC',
    });
  });

  // Sync office controls
  private syncControls = effect(() => {
    this.offices().forEach((office) => {
      if (!this.officeControls[office.id]) {
        this.officeControls[office.id] = {
          name: this.utils.requiredText(office.name),
          externalId: this.utils.makeControl(office.externalId ?? ''),
          parentId: this.utils.makeControl(office.parentId ?? null),
          openingDate: this.utils.requiredText(office.openingDate ?? ''),
        };
      } else {
        const controls = this.officeControls[office.id];
        controls.name.setValue(office.name, { emitEvent: false });
        controls.externalId.setValue(office.externalId ?? '', { emitEvent: false });
        controls.parentId.setValue(office.parentId ?? null, { emitEvent: false });
        controls.openingDate.setValue(office.openingDate ?? '', { emitEvent: false });
      }
    });
  });

  // Methods
  createOffice() {
    if (this.createOfficeForm.invalid) return;
    const office: CreateOfficeDto = this.createOfficeForm.value as CreateOfficeDto;

    this.officesService.createOffice(office).subscribe({
      next: () =>
        this.createOfficeForm.reset({
          name: '',
          externalId: '',
          parentId: 1,
          openingDate: new Date().toISOString().split('T')[0],
          locale: APP_DEFAULTS.LOCALE,
          dateFormat: APP_DEFAULTS.DATE_FORMAT,
        }),
      error: (err) => this.error.set(err.message || 'Failed to create office'),
    });
  }

  updateOffice(office: Office) {
    const controls = this.officeControls[office.id];
    if (!controls) return;

    const payload: UpdateOfficeDto = {
      name: controls.name.value,
      externalId: controls.externalId.value,
      parentId: controls.parentId.value ?? undefined,
      openingDate: controls.openingDate.value,
    };

    this.officesService.updateOffice(office.id, payload).subscribe({
      error: (err) => this.error.set(err.message || 'Failed to update office'),
    });
  }
}
