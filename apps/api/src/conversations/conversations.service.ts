import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const conversations = [
  {
    id: 'conv_1',
    contact: { id: 'contact_1', name: 'María López', phone: '+521234567890', locale: 'es' },
    channel: 'whatsapp',
    status: 'open',
    lastMessage: 'Hola, ¿cómo avanzo con la inscripción?',
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg_1',
        direction: 'in',
        body: 'Hola, ¿cómo avanzo con la inscripción?'
      }
    ]
  }
];

@Injectable()
export class ConversationsService {
  findAll(_query: PaginationQueryDto) {
    return conversations;
  }

  findOne(id: string) {
    return conversations.find((item) => item.id === id);
  }
}
