import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LeadStatus {
  Nuevo = 'Nuevo',
  Contactado = 'Contactado',
  Cualificado = 'Cualificado',
  EnProceso = 'En proceso',
  Ganado = 'Ganado',
  Perdido = 'Perdido'
}

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  contactId!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
