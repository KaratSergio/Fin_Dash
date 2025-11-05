export interface CreateLoanChargeDto {
  chargeId: number;
  amount: number;
  dueDate?: string;
  externalId?: string;
  locale?: string;
  dateFormat?: string;
}

export interface UpdateLoanChargeDto {
  amount?: number;
  dueDate?: string;
  externalId?: string;
  locale?: string;
  dateFormat?: string;
}

export interface PayLoanChargeDto {
  amount: number;
  paymentDate: string;
  dateFormat?: string;
  locale?: string;
}

export interface WaiveLoanChargeDto {
  note?: string;
}

export interface AdjustLoanChargeDto {
  amount: number;
  note?: string;
}