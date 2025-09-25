import { Injectable } from '@nestjs/common';

const automations = [
  {
    id: 'auto_1',
    name: 'Recordatorio 24h sin respuesta',
    trigger: { event: 'no_response', afterMinutes: 1440 },
    actions: [{ type: 'notify', channel: 'internal' }],
    isActive: true
  }
];

@Injectable()
export class AutomationsService {
  findAll() {
    return automations;
  }

  create(payload: any) {
    return { id: `auto_${Date.now()}`, ...payload };
  }

  toggle(id: string, isActive: boolean) {
    return { id, isActive };
  }
}
