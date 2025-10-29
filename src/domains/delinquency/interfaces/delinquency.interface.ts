export interface DelinquencyRange {
  id: number;
  name: string;
  minDays: number;
  maxDays: number;
}

export interface DelinquencyBucket {
  id: number;
  name: string;
  ranges: DelinquencyRange[];
}