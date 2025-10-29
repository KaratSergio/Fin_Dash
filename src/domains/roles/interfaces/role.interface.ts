export interface Role {
  id: number;           // Role ID
  name: string;         // Role name
  description?: string; // Optional description
  disabled?: boolean;   // Whether role is disabled
}
