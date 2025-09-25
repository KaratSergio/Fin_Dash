import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [],
  template: `<h2>Logs</h2>`,
  styles: [],
})
export class LogsAdminPage {
  loading = signal(true);

  constructor() {}
}
