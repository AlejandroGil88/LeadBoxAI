import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.contactsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Get(':id/consents')
  findConsents(@Param('id') id: string) {
    return this.contactsService.getConsents(id);
  }

  @Post(':id/consents')
  updateConsents(@Param('id') id: string, @Body() payload: any) {
    return this.contactsService.updateConsents(id, payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: any) {
    return { id, ...payload };
  }

  @Post()
  create(@Body() payload: any) {
    return { id: `contact_${Date.now()}`, ...payload };
  }
}
