export interface Client {
    id: number;                // Client ID
    externalId: string;        // External system ID (optional)
    firstname: string;         // First name of the client
    lastname: string;          // Last name of the client
    displayName: string;       // Full display name (optional)
    mobileNo: string;          // Mobile phone number (optional)
    emailAddress: string;      // Email address (optional)
    officeId: number;          // Office ID the client belongs to
    officeName: string;        // Office name the client belongs to (optional)
    active: boolean;           // Is client active? (optional)
    activationDate: string;    // Date when client was activated (yyyy-MM-dd) (optional)
}