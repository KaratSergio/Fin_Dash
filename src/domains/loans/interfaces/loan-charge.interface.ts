export interface LoanChargeTimeType {
  id: number;
  value: string;
}

export interface LoanChargeCalculationType {
  id: number;
  value: string;
}

export interface LoanChargePaymentMode {
  id: number;
  value: string;
}

export interface LoanCharge {
  id: number;
  name: string;
  chargeTimeType: LoanChargeTimeType;
  chargeCalculationType: LoanChargeCalculationType;
  chargePaymentMode: LoanChargePaymentMode;
  amount: number;
  amountPaid?: number;
  amountWaived?: number;
  amountOutstanding?: number;
  penalty?: boolean;
  dueDate?: string;
  chargeType?: string;
  externalId?: string;
}

export interface LoanChargeTemplate {
  chargeOptions: Array<{
    id: number;
    name: string;
    penalty: boolean;
    chargeAppliesTo: { id: number; value: string };
  }>;
}