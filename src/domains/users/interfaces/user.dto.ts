interface UserDto {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  repeatPassword: string;
  sendPasswordToEmail: boolean;

  officeId: number;
  roles: number[];
}

export interface CreateUserDto extends UserDto {}

export type UpdateUserDto = Partial<UserDto>;
