import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { LeadStatus } from './create-lead.dto';

export class LeadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus, { each: false })
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
