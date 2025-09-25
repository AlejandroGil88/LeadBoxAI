import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }

  @Post()
  create(@Body() payload: any) {
    return this.campaignsService.create(payload);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body() payload: any) {
    return this.campaignsService.schedule(id, payload);
  }

  @Get(':id/stats')
  stats(@Param('id') id: string) {
    return this.campaignsService.stats(id);
  }
}
