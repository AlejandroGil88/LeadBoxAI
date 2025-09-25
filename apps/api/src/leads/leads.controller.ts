import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('ownerId') ownerId: string) {
    return this.leadsService.assign(id, ownerId);
  }

  @Post(':id/tag')
  addTag(@Param('id') id: string, @Body('tag') tag: string) {
    return this.leadsService.addTag(id, tag);
  }
}
