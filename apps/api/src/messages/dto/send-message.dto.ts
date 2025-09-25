import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';

export const SUPPORTED_MESSAGE_CHANNELS = ['whatsapp'] as const;

export class SendMessageDto {
  @IsIn(SUPPORTED_MESSAGE_CHANNELS)
  channel!: (typeof SUPPORTED_MESSAGE_CHANNELS)[number];

  @ValidateIf((dto: SendMessageDto) => !dto.templateId)
  @IsString()
  @IsNotEmpty()
  body?: string;

  @ValidateIf((dto: SendMessageDto) => !dto.body)
  @IsString()
  @IsNotEmpty()
  templateId?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsString()
  bodyOriginal?: string;

  @IsOptional()
  @IsString()
  langSrc?: string;

  @IsOptional()
  @IsString()
  langDest?: string;
}
