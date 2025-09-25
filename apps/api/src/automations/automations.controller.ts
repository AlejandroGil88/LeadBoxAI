import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { ToggleAutomationDto } from './dto/toggle-automation.dto';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  findAll() {
    return this.automationsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAutomationDto) {
    return this.automationsService.create(dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: ToggleAutomationDto) {
    return this.automationsService.toggle(id, body.isActive);
  }
}
