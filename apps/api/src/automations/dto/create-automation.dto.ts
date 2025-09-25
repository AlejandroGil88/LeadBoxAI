import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AutomationTriggerType {
  NoReplyHours = 'no_reply_hours',
  LeadCreated = 'lead_created',
  LeadStatusChanged = 'lead_status_changed',
  TagAdded = 'tag_added'
}

export class AutomationTriggerDto {
  @IsEnum(AutomationTriggerType)
  type!: AutomationTriggerType;

  @ValidateIf((trigger) => trigger.type === AutomationTriggerType.NoReplyHours)
  @IsNumber()
  @Min(1)
  hours?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export enum AutomationActionType {
  SendWhatsapp = 'send_whatsapp',
  AssignOwner = 'assign_owner',
  AddTag = 'add_tag',
  ScheduleReminder = 'schedule_reminder',
  UpdateField = 'update_field',
  ReassignIdle = 'reassign_idle',
  NotifyOwner = 'notify_owner'
}

export class AutomationActionDto {
  @IsEnum(AutomationActionType)
  type!: AutomationActionType;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateNested()
  @Type(() => AutomationTriggerDto)
  trigger!: AutomationTriggerDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AutomationActionDto)
  actions!: AutomationActionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
