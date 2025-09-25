import { Body, Controller, Get, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('kb/articles')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll() {
    return this.knowledgeService.findAll();
  }

  @Post()
  create(@Body() payload: any) {
    return this.knowledgeService.create(payload);
  }
}
