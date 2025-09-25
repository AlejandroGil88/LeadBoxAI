import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SeedMessageDto } from './dto/seed-message.dto';

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

  @Post('seed-message')
  seedMessage(@Body() payload: SeedMessageDto) {
    return this.conversationsService.seedMessage(payload);
  }
}
