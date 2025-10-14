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
    loanType: string;

    disbursementData: {
        expectedDisbursementDate: string;
        principal: number;
    }[];

    locale: string;
    dateFormat: string;
}
