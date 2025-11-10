interface OfficeDto {
  name: string;
  parentId: number;
  dateFormat: string;
  locale: string;
  openingDate: string; // formatted for API

  externalId?: string;
}

export interface CreateOfficeDto extends OfficeDto { }

export type UpdateOfficeDto = Partial<OfficeDto>;

export interface OfficeQueryDto {
  fields?: string;
  orderBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeAllOffices?: boolean;
}
