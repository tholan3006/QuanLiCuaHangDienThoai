import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  username!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsIn(['ADMIN', 'STAFF', 'CUSTOMER'])
  role!: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'STAFF', 'CUSTOMER'])
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export class UpdateRoleDto {
  @IsIn(['ADMIN', 'STAFF', 'CUSTOMER'])
  role!: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export class UpdateStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
