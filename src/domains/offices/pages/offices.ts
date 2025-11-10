import { RouterModule } from '@angular/router';
import { Component, inject, effect } from '@angular/core';
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
  total = this.officesService.total;
  loading = this.officesService.loading;
  error = this.officesService.error;

  // Form for creating office
  createOfficeForm = this.fb.group({
    name: this.utils.requiredText(),
    parentId: this.utils.requiredNumberNN(1),
    openingDate: this.utils.requiredText(new Date().toISOString().split('T')[0]),
    locale: this.utils.makeControl(APP_DEFAULTS.LOCALE),
    dateFormat: this.utils.makeControl(APP_DEFAULTS.DATE_FORMAT),
  });

  // Controls for editing existing offices
  officeControls: Record<number, {
    name: FormControl<string>;
    parentId: FormControl<number | null>;
    openingDate: FormControl<string>;
  }> = {};

  // Load offices initially
  private loadOffices = effect(
    () => {
      this.officesService.setQueryParams({
        fields: 'id,externalId,name,openingDate,parentId',
        orderBy: 'name',
        sortOrder: 'ASC',
      });
    },
    { allowSignalWrites: true }
  );

  // Sync office controls
  private syncControls = effect(() => {
    const offices = this.offices();
    offices.forEach((office) => {
      if (!this.officeControls[office.id]) {
        this.officeControls[office.id] = {
          name: this.utils.requiredText(office.name),
          parentId: this.utils.makeControl(office.parentId ?? null),
          openingDate: this.utils.requiredText(office.openingDate ?? ''),
        };
      } else {
        const controls = this.officeControls[office.id];
        controls.name.setValue(office.name, { emitEvent: false });
        controls.parentId.setValue(office.parentId ?? null, { emitEvent: false });
        controls.openingDate.setValue(office.openingDate ?? '', { emitEvent: false });
      }
    });

    // Clean up controls for offices that no longer exist
    const currentOfficeIds = new Set(offices.map(office => office.id));
    Object.keys(this.officeControls).forEach(idStr => {
      const id = Number(idStr);
      if (!currentOfficeIds.has(id)) {
        delete this.officeControls[id];
      }
    });
  });

  // Actions
  createOffice() {
    if (this.createOfficeForm.invalid) return;

    const office: CreateOfficeDto = this.createOfficeForm.value as CreateOfficeDto;

    this.officesService.createOffice(office);

    // Reset form immediately (optimistic update)
    this.createOfficeForm.reset({
      name: '',
      parentId: 1,
      openingDate: new Date().toISOString().split('T')[0],
      locale: APP_DEFAULTS.LOCALE,
      dateFormat: APP_DEFAULTS.DATE_FORMAT,
    });
  }

  updateOffice(office: Office) {
    const controls = this.officeControls[office.id];
    if (!controls) return;

    const payload: UpdateOfficeDto = {
      name: controls.name.value,
      parentId: controls.parentId.value ?? undefined,
      openingDate: controls.openingDate.value,
    };

    this.officesService.updateOffice(office.id, payload);
  }

  // Refresh offices manually if needed
  refreshOffices() {
    this.officesService.refresh();
  }

  // Clear any filters/search
  clearFilters() {
    this.officesService.clearQueryParams();
  }

  // Search/filter offices
  searchOffices(params: { search?: string; parentId?: number }) {
    this.officesService.setQueryParams({
      ...params,
      fields: 'id,externalId,name,openingDate,parentId',
      orderBy: 'name',
      sortOrder: 'ASC',
    });
  }
}