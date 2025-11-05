export interface CreateLoanDto {
  clientId: number;
  productId: number;
  principal: number;
  expectedDisbursementDate: string;
  submittedOnDate: string;

  loanTermFrequency: number;
  loanTermFrequencyType: number;
  numberOfRepayments: number;
  repaymentEvery: number;
  repaymentFrequencyType: number;
  interestType: number;
  interestCalculationPeriodType: number;
  amortizationType: number;
  interestRatePerPeriod: number;
  transactionProcessingStrategyCode: string;
  maxOutstandingLoanBalance: number;
  loanType: string;

  disbursementData: {
    expectedDisbursementDate: string;
    principal: number;
  }[];

  locale: string;
  dateFormat: string;
}


export interface UpdateLoanDto {
  clientId: number;
  productId: number;
  principal?: number;
  expectedDisbursementDate?: string;
  submittedOnDate?: string;
  loanTermFrequency?: number;
  loanTermFrequencyType?: number;
  numberOfRepayments?: number;
  repaymentEvery?: number;
  repaymentFrequencyType?: number;
  interestType?: number;
  interestCalculationPeriodType?: number;
  amortizationType?: number;
  interestRatePerPeriod?: number;
  transactionProcessingStrategyCode?: string;
  loanType?: string;
  disbursementData?: {
    expectedDisbursementDate: string;
    principal: number;
    dateFormat: string;
    locale: string;
  }[];
  locale?: string;
  dateFormat?: string;
}


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
