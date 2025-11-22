export interface JournalEntry {
  id: number;
  officeId: number;
  officeName: string;
  transactionId: string;
  transactionDate: string;
  submittedOnDate: string;
  entryType: {
    id: number;
    code: string;
    value: string;
  };
  glAccountType: {
    id: number;
    code: string;
    value: string;
  };
  currency: {
    code: string;
    name: string;
    displaySymbol: string;
    decimalPlaces: number;
  };
  amount: number;
  comments?: string;
  createdByUserId: number;
  createdByUserName: string;
  createdDate: string;
  reversed: boolean;
  referenceNumber: string;
  glAccountId: number;
  glAccountName: string;
  glAccountCode: string;
  manualEntry: boolean;
  entityId?: number;
  entityType?: {
    id: number;
    code: string;
    value: string;
  };
  officeRunningBalance?: number;
  organizationRunningBalance?: number;
  runningBalanceComputed: boolean;
  transactionDetails?: {
    transactionId: number;
    transactionType: {
      id: number;
      code: string;
      value: string;
    };
    paymentDetails?: {
      id: number;
      paymentType: {
        id: number;
        name: string;
        description: string;
        isCashPayment: boolean;
      };
      accountNumber?: string;
      checkNumber?: string;
      receiptNumber?: string;
    };
    noteData?: any;
  };
}

export interface JournalEntrySearchParams {
  officeId?: number;
  glAccountId?: number;
  transactionId?: string;
  fromDate?: string;
  toDate?: string;
  submittedOnDateFrom?: string;
  submittedOnDateTo?: string;
  manualEntriesOnly?: boolean;
  entityType?: number;
  loanId?: number;
  savingsId?: number;
  runningBalance?: boolean;
  transactionDetails?: boolean;
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortOrder?: string;
}

export interface JournalEntriesResponse {
  pageItems: JournalEntry[];
  totalFilteredRecords: number;
}