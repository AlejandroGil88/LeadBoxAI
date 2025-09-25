import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

const demoLeads = [
  {
    id: 'lead_1',
    name: 'María López',
    status: 'Nuevo',
    owner: 'Agente 01',
    source: 'Formulario Landing',
    score: 78,
    tags: ['becas', 'latam']
  },
  {
    id: 'lead_2',
    name: 'John Doe',
    status: 'Contactado',
    owner: 'Agente 02',
    source: 'Campaña WhatsApp',
    score: 65,
    tags: ['postgrado']
  }
];

@Injectable()
export class LeadsService {
  findAll() {
    return demoLeads;
  }

  findOne(id: string) {
    return demoLeads.find((lead) => lead.id === id);
  }

  create(dto: CreateLeadDto) {
    return { id: `lead_${Date.now()}`, ...dto };
  }

  update(id: string, dto: UpdateLeadDto) {
    return { id, ...dto };
  }

  assign(id: string, ownerId: string) {
    return { id, ownerId };
  }

  addTag(id: string, tag: string) {
    return { id, tag };
  }
}
