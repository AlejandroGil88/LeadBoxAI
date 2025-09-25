import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsGateway } from '../conversations/conversations.gateway';
import { SendMessageDto } from './dto/send-message.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsGateway: ConversationsGateway
  ) {}

  async sendMessage(conversationId: string, payload: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: { select: { locale: true } } }
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.channel !== payload.channel) {
      throw new BadRequestException('Channel does not match conversation channel');
    }

    if (payload.variables) {
      const invalidEntry = Object.values(payload.variables).some(
        (value) => typeof value !== 'string'
      );
      if (invalidEntry) {
        throw new BadRequestException('Template variables must be strings');
      }
    }

    let body = payload.body ?? '';
    let bodyOriginal = payload.bodyOriginal ?? payload.body ?? undefined;
    let status: 'queued' | 'sent' = payload.templateId ? 'queued' : 'sent';
    let sentAt: Date | null = status === 'sent' ? new Date() : null;

    if (payload.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: payload.templateId }
      });

      if (!template) {
        throw new NotFoundException(`Template ${payload.templateId} not found`);
      }

      if (!template.isApproved) {
        throw new BadRequestException('Template is not approved for sending');
      }

      if (template.channel !== payload.channel) {
        throw new BadRequestException('Template channel does not match requested channel');
      }

      const variables: Record<string, string> = payload.variables ?? {};
      const missingVariables = (template.variables ?? []).filter(
        (variable: string) => variables[variable] === undefined
      );

      if (missingVariables.length) {
        throw new BadRequestException(
          `Missing template variables: ${missingVariables.join(', ')}`
        );
      }

      bodyOriginal = template.content;
      body = template.content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match: string, key: string) => {
        return variables[key] ?? match;
      });

      status = 'queued';
      sentAt = null;
    }

    const now = new Date();

    const message = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          direction: 'out',
          channel: payload.channel,
          body,
          body_original: bodyOriginal,
          templateId: payload.templateId,
          status,
          sentAt,
          lang_src: payload.langSrc,
          lang_dest: payload.langDest
        }
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: now }
      });

      return created;
    });

    this.conversationsGateway.emitConversationUpdate({
      id: conversationId,
      lastMessage: {
        id: message.id,
        body: message.body,
        direction: message.direction,
        channel: message.channel,
        createdAt: message.createdAt,
        status: message.status,
        lang_src: message.lang_src,
        lang_dest: message.lang_dest
      }
    });

    return message;
  }

  async findOne(id: string) {
    return { id, body: 'Mensaje demo' };
  }
}
