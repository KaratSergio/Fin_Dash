import { Component, signal } from "@angular/core";

export interface User {
    id: number;
    // .... 
}

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [],
    template: `<h2>Users</h2>`,
    styles: []
})
export class UsersAdminPage {
    loading = signal(true);
    users = signal<{}>([])

    constructor() { }
}