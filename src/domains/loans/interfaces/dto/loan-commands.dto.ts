export interface ApproveLoanDto {
  approvedOnDate: string;
  approvedLoanAmount: number;
  note?: string;
  dateFormat: string;
  locale: string;
}

export interface DisburseLoanDto {
  actualDisbursementDate: string;
  note?: string;
  dateFormat: string;
  locale: string;
}

export interface RejectLoanDto {
  rejectedOnDate: string;
  note?: string;
  dateFormat: string;
  locale: string;
}
