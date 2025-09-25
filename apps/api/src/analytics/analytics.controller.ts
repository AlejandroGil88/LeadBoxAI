import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('funnel')
  getFunnel() {
    return this.analyticsService.getFunnel();
  }

  @Get('agents')
  getAgents() {
    return this.analyticsService.getAgents();
  }

  @Get('campaigns')
  getCampaigns() {
    return this.analyticsService.getCampaigns();
  }
}
