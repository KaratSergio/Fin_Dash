import { GLAccount } from './gl-account.interface';

export interface GLAccountCreateDto {
    name: string;
    glCode: string;
    description: string;
    manualEntriesAllowed: boolean;
    type: number;
    usage: number;

    parentId?: number;
    tagId?: number;
}

export interface GLAccountUpdateDto extends Partial<GLAccountCreateDto> { }

// Represents the template data for creating GL Accounts
// (used to populate dropdowns or default values)
export interface GLAccountsTemplateResponseDto {
    accountTypeOptions: { id: number; code: string; value: string }[];
    usageOptions: { id: number; code: string; value: string }[];
    allowedAssetsTagOptions: { id: number; name: string }[];
    allowedLiabilitiesTagOptions: { id: number; name: string }[];
    allowedEquityTagOptions: { id: number; name: string }[];
    allowedIncomeTagOptions: { id: number; name: string }[];
    allowedExpensesTagOptions: { id: number; name: string }[];
    assetHeaderAccountOptions: GLAccount[];
    liabilityHeaderAccountOptions: GLAccount[];
    equityHeaderAccountOptions: GLAccount[];
    incomeHeaderAccountOptions: GLAccount[];
    expenseHeaderAccountOptions: GLAccount[];
}
