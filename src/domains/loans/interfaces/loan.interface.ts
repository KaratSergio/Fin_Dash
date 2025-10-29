export interface LoanTimeline {
  submittedOnDate: [number, number, number];
  actualMaturityDate: [number, number, number];
  expectedDisbursementDate: [number, number, number];
  expectedMaturityDate: [number, number, number];
  submittedByFirstname: string;
  submittedByLastname: string;
  submittedByUsername: string;
}

export interface Loan {
  id: number;
  loanType: string;
  clientId: number;
  clientName?: string;
  loanProductId: number;
  loanProductName?: string;
  accountNo: string;

  principal: number;
  interestRatePerPeriod: number;
  numberOfRepayments: number;
  loanTermFrequency: number;
  loanTermFrequencyType: number;
  repaymentEvery: number;
  repaymentFrequencyType: number;
  interestRateFrequencyType: number;
  interestType: number;
  amortizationType: number;

  graceOnPrincipalPayment: number;
  graceOnInterestPayment: number;
  graceOnInterestCharged: number;
  maxOutstandingLoanBalance: number;
  fixedEmiAmount: number;

  disbursementData?: {
    expectedDisbursementDate: string;
    principal: number;
  }[];

  transactionProcessingStrategyCode?: string;
  interestCalculationPeriodType?: number;

  expectedDisbursementDate: string;
  submittedOnDate?: string;
  approvedOnDate?: string;

  timeline?: LoanTimeline;
  status?: {
    id: number;
    code: string;
    value: string;
  };

  locale: string;
  dateFormat: string;
}
