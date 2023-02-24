import { Expose } from 'class-transformer';
import { IsDefined, IsEmail, IsOptional, IsString } from 'class-validator';

export class UserLoginDTO {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Expose()
  email: string;

  @IsDefined()
  @IsString()
  @Expose()
  password: string;
}