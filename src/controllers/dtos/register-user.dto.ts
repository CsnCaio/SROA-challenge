import { IsDefined, IsEmail, IsOptional, IsString } from 'class-validator';
import {Expose} from 'class-transformer';

export class registerUserDTO {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Expose()
  email: string;

  @IsDefined()
  @IsString()
  @Expose()
  password: string;

  @IsDefined()
  @IsString()
  @Expose()
  name: string;

  @IsOptional()
  @IsString()
  @Expose()
  dob?: string;

  @IsDefined()
  @IsString()
  @Expose()
  role: 'ADMIN' | 'NORMAL_USER';
}