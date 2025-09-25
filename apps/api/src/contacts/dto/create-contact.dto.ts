import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Matches(E164_REGEX, { message: 'phone must be in E.164 format' })
  phone_e164!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  consent?: Record<string, unknown>;
}
