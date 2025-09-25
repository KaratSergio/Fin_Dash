import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [],
  template: `<h2>Roles</h2>`,
  styles: [],
})
export class RolesAdminPage {
  loading = signal(true);

  constructor() {}
}
