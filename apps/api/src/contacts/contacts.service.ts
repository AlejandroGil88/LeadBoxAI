import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const contacts = [
  {
    id: 'contact_1',
    name: 'María López',
    phone_e164: '+521234567890',
    locale: 'es',
    country: 'MX',
    timezone: 'America/Mexico_City',
    tags: ['becas'],
    consent: { whatsapp: true }
  }
];

@Injectable()
export class ContactsService {
  findAll(_query: PaginationQueryDto) {
    return contacts;
  }

  findOne(id: string) {
    return contacts.find((contact) => contact.id === id);
  }

  getConsents(id: string) {
    return { contactId: id, logs: [] };
  }

  updateConsents(id: string, payload: any) {
    return { contactId: id, consent: payload };
  }
}
