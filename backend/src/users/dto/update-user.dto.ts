import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'STAFF', 'CUSTOMER'])
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}
