import { Injectable } from '@nestjs/common';
import { ConversationsGateway } from '../conversations/conversations.gateway';

@Injectable()
export class MessagesService {
  constructor(private readonly conversationsGateway: ConversationsGateway) {}

  async sendMessage(conversationId: string, payload: any) {
    const message = {
      id: `msg_${Date.now()}`,
      conversationId,
      status: 'sent',
      ...payload
    };
    this.conversationsGateway.emitConversationUpdate({ id: conversationId, lastMessage: payload.body });
    return message;
  }

  async findOne(id: string) {
    return { id, body: 'Mensaje demo' };
  }
}
