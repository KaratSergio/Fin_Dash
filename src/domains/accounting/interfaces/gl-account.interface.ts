export interface GLAccountType {
    id: number;
    code: string;
    value: string;
}

export interface GLAccountUsage {
    id: number;
    code: string;
    value: string;
}

export interface GLAccount {
    id: number;                         // Unique account ID
    name: string;                       // Account name
    glCode: string;                     // General Ledger code
    disabled: boolean;                  // Whether the account is disabled
    manualEntriesAllowed: boolean;      // Whether manual journal entries are allowed
    type: GLAccountType;                // Account type (e.g., ASSET, LIABILITY)
    usage: GLAccountUsage;              // Usage type (e.g., HEADER or DETAIL)
    tagId: number;
    parentId: number;
    description: string;
    organizationRunningBalance: number;
}
