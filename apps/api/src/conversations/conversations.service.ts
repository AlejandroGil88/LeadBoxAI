import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SeedMessageDto } from './dto/seed-message.dto';

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

  seedMessage(payload: SeedMessageDto) {
    const now = new Date().toISOString();
    const message = {
      id: `msg_${randomUUID()}`,
      direction: 'in',
      body: payload.body,
      createdAt: now
    };

    const existingConversation = conversations.find(
      (item) => item.contact.phone === payload.contactPhone
    );

    if (existingConversation) {
      existingConversation.lastMessage = payload.body;
      existingConversation.updatedAt = now;
      existingConversation.messages.push(message);

      return {
        conversationId: existingConversation.id,
        message
      };
    }

    const conversation = {
      id: `conv_${randomUUID()}`,
      contact: {
        id: `contact_${randomUUID()}`,
        name: payload.contactPhone,
        phone: payload.contactPhone,
        locale: 'es'
      },
      channel: 'whatsapp',
      status: 'open',
      lastMessage: payload.body,
      updatedAt: now,
      messages: [message]
    };

    conversations.push(conversation);

    return {
      conversationId: conversation.id,
      message
    };
  }
}
