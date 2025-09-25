import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SeedMessageDto {
  @IsPhoneNumber()
  contactPhone!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}
