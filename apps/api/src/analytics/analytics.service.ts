import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getFunnel() {
    return {
      stages: [
        { stage: 'Nuevo', count: 4200 },
        { stage: 'Contactado', count: 2800 },
        { stage: 'Cualificado', count: 1650 },
        { stage: 'En proceso', count: 860 },
        { stage: 'Ganado', count: 410 }
      ]
    };
  }

  getAgents() {
    return {
      agents: [
        { id: 'agent_1', name: 'Agente 01', firstResponseMinutes: 8, satisfaction: 4.8 },
        { id: 'agent_2', name: 'Agente 02', firstResponseMinutes: 11, satisfaction: 4.5 }
      ]
    };
  }

  getCampaigns() {
    return {
      campaigns: [
        { id: 'cmp_1', name: 'Becas Primavera', ctr: 0.38, replies: 320, conversions: 48 }
      ]
    };
  }
}
