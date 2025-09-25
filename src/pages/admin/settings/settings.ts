import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [],
  template: `<h2>Setting</h2>`,
  styles: [],
})
export class SettingsAdminPage {
  loading = signal(true);

  constructor() {}
}
