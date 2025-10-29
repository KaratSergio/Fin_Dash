export const extractId = (value: any, fallback: number): number =>
  typeof value === 'object' && value !== null && 'id' in value ? value.id : (value ?? fallback);

export const extractString = (value: any, fallback: string): string =>
  value && typeof value === 'object' && 'value' in value ? value.value : (value ?? fallback);
