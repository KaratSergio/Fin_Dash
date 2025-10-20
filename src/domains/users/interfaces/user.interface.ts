import { Role } from '@domains/roles/services/roles.service';

export interface AppUser {
    id: number;                   // User ID
    username: string;             // Login name
    firstname: string;            // First name
    lastname: string;             // Last name
    email: string;                // Email
    password: string;             // Password (only on create/change)
    sendPasswordToEmail: boolean; // Send password to Email

    officeId: number;             // Office ID the user belongs to
    officeName: string;           // Office name the user belongs to     

    selectedRoles: Role[];        // List of assigned roles
    roles: number[];              // User roles ID
}