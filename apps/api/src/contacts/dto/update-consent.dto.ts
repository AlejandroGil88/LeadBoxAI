import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateConsentDto {
  @IsNotEmpty()
  @IsString()
  scope!: string;

  @IsNotEmpty()
  @IsString()
  channel!: string;

  @IsBoolean()
  granted!: boolean;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
