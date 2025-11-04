import { Component, inject, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';

import { UsersService } from '@domains/users/services/user.service';
import { RolesService } from '@domains/roles/services/roles.service';
import { OfficesService } from '@domains/offices/services/offices.service';
import { AppUser } from '@domains/users/interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '@domains/users/interfaces/user.dto';
import { FormUtils } from '@core/utils/form';

import { UsersForm } from '../components/users-form/users-form';
import { UsersTable } from '../components/users-table/users-table';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterModule, UsersForm, UsersTable],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersAdminPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);

  usersService = inject(UsersService);
  rolesService = inject(RolesService);
  officesService = inject(OfficesService);

  users = this.usersService.users;
  roles = this.rolesService.roles;
  loading = this.usersService.loading;
  error = this.usersService.error;

  // Create User Form
  createUserForm = this.fb.group({
    username: this.utils.requiredText(),
    firstname: this.utils.requiredText(),
    lastname: this.utils.requiredText(),
    email: this.utils.requiredEmail(),
    password: this.utils.requiredText(),
    officeId: this.utils.optionalNumber(),
    roles: this.utils.makeControl<number[]>([], []),
  });

  // Controls for editing users
  userControls: Record<
    number,
    {
      username: FormControl<string | null>;
      firstname: FormControl<string | null>;
      lastname: FormControl<string | null>;
      email: FormControl<string | null>;
      roles: FormControl<number[]>;
      office: FormControl<number | null>;
    }
  > = {};

  // Load users, roles, offices
  private loadData = effect(() => {
    this.usersService.refresh();
    this.rolesService.refresh();
    this.officesService.refresh();
  });

  // Sync controls with latest data
  private syncControls = effect(() => {
    const list: AppUser[] = this.users();
    list.forEach((u) => {
      if (!this.userControls[u.id]) {
        this.userControls[u.id] = {
          username: new FormControl(u.username ?? ''),
          firstname: new FormControl(u.firstname ?? ''),
          lastname: new FormControl(u.lastname ?? ''),
          email: new FormControl(u.email ?? ''),
          roles: new FormControl<number[]>(u.roles ?? [], { nonNullable: true }),
          office: new FormControl(u.officeId ?? null),
        };
      } else {
        const controls = this.userControls[u.id];
        controls.username.setValue(u.username ?? '', { emitEvent: false });
        controls.firstname.setValue(u.firstname ?? '', { emitEvent: false });
        controls.lastname.setValue(u.lastname ?? '', { emitEvent: false });
        controls.email.setValue(u.email ?? '', { emitEvent: false });
        controls.roles.setValue(u.roles ?? [], { emitEvent: false });
        controls.office.setValue(u.officeId ?? null, { emitEvent: false });
      }
    });
  });

  // Actions
  createUser() {
    if (this.createUserForm.invalid) return;
    const f = this.createUserForm.value;

    const payload: CreateUserDto = {
      username: f.username ?? '',
      firstname: f.firstname ?? '',
      lastname: f.lastname ?? '',
      email: f.email ?? '',
      password: f.password ?? '',
      officeId: f.officeId ?? 0,
      roles: f.roles ?? [],
      sendPasswordToEmail: false,
      repeatPassword: f.password ?? '',
    };

    this.usersService.createUser(payload)
  }

  updateUser(user: AppUser) {
    const controls = this.userControls[user.id];
    if (!controls) return;

    const payload: UpdateUserDto = {
      username: controls.username.value ?? '',
      firstname: controls.firstname.value ?? '',
      lastname: controls.lastname.value ?? '',
      email: controls.email.value ?? '',
      roles: controls.roles.value ?? [],
      officeId: controls.office.value ?? undefined,
    };

    this.usersService.updateUser(user.id, payload)
  }

  deleteUser(id: number) {
    this.usersService.deleteUser(id)
  }
}
