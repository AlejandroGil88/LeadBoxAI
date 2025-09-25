import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.conversationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }
}
