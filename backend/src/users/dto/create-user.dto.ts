import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['ADMIN', 'STAFF', 'CUSTOMER'])
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}
