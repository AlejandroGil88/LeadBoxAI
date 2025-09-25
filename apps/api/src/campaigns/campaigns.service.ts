import { Injectable } from '@nestjs/common';

const campaigns = [
  {
    id: 'cmp_1',
    name: 'Becas Primavera',
    status: 'draft',
    scheduleAt: null,
    stats: { delivered: 0, read: 0, replied: 0, converted: 0 }
  }
];

@Injectable()
export class CampaignsService {
  findAll() {
    return campaigns;
  }

  create(payload: any) {
    return { id: `cmp_${Date.now()}`, ...payload };
  }

  schedule(id: string, payload: any) {
    return { id, scheduled: payload }; 
  }

  stats(id: string) {
    return { id, stats: { delivered: 1200, read: 950, replied: 320, converted: 48 } };
  }
}
