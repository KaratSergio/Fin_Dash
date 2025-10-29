interface OfficeDto {
  name: string;
  externalId: string;
  parentId: number;
  dateFormat: string;
  locale: string;
  openingDate: string; // formatted for API
}

export interface CreateOfficeDto extends OfficeDto {}

export type UpdateOfficeDto = Partial<OfficeDto>;

export interface OfficeQueryDto {
  fields?: string;
  orderBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeAllOffices?: boolean;
}
