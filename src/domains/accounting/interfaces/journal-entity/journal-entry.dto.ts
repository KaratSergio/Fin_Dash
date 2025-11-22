export interface CreateJournalEntryDto {
  officeId: number;
  transactionDate: string;
  currencyCode: string;
  comments?: string;
  referenceNumber: string;
  paymentTypeId?: number;
  accountNumber?: string;
  checkNumber?: string;
  receiptNumber?: string;
  entries: JournalEntryLineDto[];
  locale?: string;
  dateFormat?: string;
}

export interface JournalEntryLineDto {
  glAccountId: number;
  amount: number;
  entryType: 'DEBIT' | 'CREDIT';
  comments?: string;
}

export interface ReverseJournalEntryDto {
  comments: string;
  reversalDate: string;
  locale?: string;
  dateFormat?: string;
}