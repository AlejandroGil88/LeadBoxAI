import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AutomationsService } from './automations.service';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  findAll() {
    return this.automationsService.findAll();
  }

  @Post()
  create(@Body() payload: any) {
    return this.automationsService.create(payload);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.automationsService.toggle(id, isActive);
  }
}
