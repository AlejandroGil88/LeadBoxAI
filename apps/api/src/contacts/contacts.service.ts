import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';

const CONTACT_INCLUDE = {
  leads: {
    select: {
      id: true,
      status: true,
      score: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }
} as const;

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 25;
    const where: Record<string, any> | undefined = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone_e164: { contains: query.search } }
          ]
        }
      : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: CONTACT_INCLUDE
      }),
      this.prisma.contact.count({ where })
    ]);

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
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: CONTACT_INCLUDE
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    return contact;
  }

  async create(dto: CreateContactDto) {
    const tags = dto.tags ? Array.from(new Set(dto.tags)) : undefined;

    try {
      return await this.prisma.contact.create({
        data: {
          name: dto.name,
          phone_e164: dto.phone_e164,
          email: dto.email,
          locale: dto.locale,
          country: dto.country,
          timezone: dto.timezone,
          tags: tags ?? [],
          consent:
            dto.consent !== undefined
              ? (dto.consent as Prisma.InputJsonValue)
              : undefined
        },
        include: CONTACT_INCLUDE
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Contact with this phone already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateContactDto) {
    const existing = await this.prisma.contact.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    const tags = dto.tags ? Array.from(new Set(dto.tags)) : undefined;

    const data: Record<string, any> = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.phone_e164 !== undefined ? { phone_e164: dto.phone_e164 } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(dto.consent !== undefined
        ? { consent: dto.consent as Prisma.InputJsonValue }
        : {})
    };

    return this.prisma.contact.update({
      where: { id },
      data: data as any,
      include: CONTACT_INCLUDE
    });
  }

  async getConsents(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      select: {
        consent: true,
        consentLogs: {
          orderBy: { grantedAt: 'desc' }
        }
      }
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    return {
      contactId: id,
      consent: contact.consent ?? {},
      logs: contact.consentLogs
    };
  }

  async updateConsents(id: string, payload: UpdateConsentDto) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      select: { consent: true }
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
    const existingScope = (contact.consent as Record<string, any> | null)?.[payload.scope] ?? {};
    const existingChannel = existingScope[payload.channel] ?? {};

    const nextEntry = {
      granted: payload.granted,
      grantedAt: payload.granted
        ? timestamp.toISOString()
        : existingChannel.grantedAt ?? timestamp.toISOString(),
      revokedAt: payload.granted ? null : timestamp.toISOString()
    };

    const nextConsent = {
      ...(contact.consent as Record<string, any> | null) ?? {},
      [payload.scope]: {
        ...existingScope,
        [payload.channel]: nextEntry
      }
    };

    const grantedAtDate = payload.granted
      ? timestamp
      : existingChannel.grantedAt
        ? new Date(existingChannel.grantedAt)
        : timestamp;

    await this.prisma.$transaction([
      this.prisma.contact.update({
        where: { id },
        data: { consent: nextConsent as Prisma.InputJsonValue }
      }),
      this.prisma.consentLog.create({
        data: {
          contactId: id,
          scope: payload.scope,
          channel: payload.channel,
          grantedAt: grantedAtDate,
          revokedAt: payload.granted ? null : timestamp
        }
      })
    ]);

    return this.getConsents(id);
  }
}
