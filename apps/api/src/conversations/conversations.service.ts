import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SeedMessageDto } from './dto/seed-message.dto';
const CONVERSATION_BASE_INCLUDE = {
  contact: {
    select: {
      id: true,
      name: true,
      phone_e164: true,
      locale: true,
      country: true,
      tags: true
    }
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} as const;

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const skip = query.skip ?? 0;
    const take = Math.min(query.take ?? 25, 100);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          ...CONVERSATION_BASE_INCLUDE,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              body: true,
              direction: true,
              channel: true,
              createdAt: true,
              lang_src: true,
              lang_dest: true,
              status: true
            }
          }
        }
      }),
      this.prisma.conversation.count()
    ]);

    const data = rows.map((conversation: (typeof rows)[number]) => {
      const { messages, ...rest } = conversation;
      return {
        ...rest,
        lastMessage: messages[0] ?? null
      };
    });

    return {
      data,
      meta: {
        total,
        skip,
        take
      }
    };
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        ...CONVERSATION_BASE_INCLUDE,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    return conversation;
  }

  async seedMessage(payload: SeedMessageDto) {
    const now = new Date();

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let contact = await tx.contact.findUnique({
        where: { phone_e164: payload.contactPhone }
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            name: payload.contactPhone,
            phone_e164: payload.contactPhone,
            tags: []
          }
        });
      }

      let conversation = await tx.conversation.findFirst({
        where: {
          contactId: contact.id,
          channel: 'whatsapp'
        }
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            contactId: contact.id,
            channel: 'whatsapp',
            status: 'open'
          }
        });
      } else {
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: now }
        });
      }

      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'in',
          channel: 'whatsapp',
          body: payload.body,
          body_original: payload.body,
          status: 'received',
          deliveredAt: now
        }
      });

      return {
        conversationId: conversation.id,
        message
      };
    });
  }
}
