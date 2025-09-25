import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError, type InputJsonValue } from '@prisma/client/runtime/library';
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
            dto.consent !== undefined ? (dto.consent as InputJsonValue) : undefined
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
      ...(dto.consent !== undefined ? { consent: dto.consent as InputJsonValue } : {})
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
        data: { consent: nextConsent as InputJsonValue }
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

  async exportContact(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        leads: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            campaign: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        conversations: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            messages: {
              include: {
                template: {
                  select: {
                    id: true,
                    name: true,
                    locale: true,
                    version: true
                  }
                }
              }
            }
          }
        },
        consentLogs: true
      }
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }

    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        entityId: id,
        entity: 'contact'
      },
      orderBy: { createdAt: 'asc' }
    });

    const contactRecord = {
      id: contact.id,
      name: contact.name,
      phone: contact.phone_e164,
      email: contact.email ?? '',
      locale: contact.locale ?? '',
      country: contact.country ?? '',
      timezone: contact.timezone ?? '',
      tags: contact.tags.join(';'),
      consent: contact.consent ? JSON.stringify(contact.consent) : ''
    };

    const sortedLeads = [...contact.leads].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const leadRecords = sortedLeads.map((lead) => ({
      id: lead.id,
      status: lead.status,
      score: lead.score ?? '',
      source: lead.source ?? '',
      campaignId: lead.campaignId ?? '',
      campaignName: lead.campaign?.name ?? '',
      ownerId: lead.owner?.id ?? '',
      ownerName: lead.owner?.name ?? '',
      ownerEmail: lead.owner?.email ?? '',
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString()
    }));

    const sortedConversations = [...contact.conversations].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const conversationRecords = sortedConversations.map((conversation) => ({
      id: conversation.id,
      channel: conversation.channel,
      status: conversation.status,
      assignedToId: conversation.assignedTo?.id ?? '',
      assignedToName: conversation.assignedTo?.name ?? '',
      assignedToEmail: conversation.assignedTo?.email ?? '',
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString()
    }));

    const messageRecords = sortedConversations.flatMap((conversation) => {
      const sortedMessages = [...conversation.messages].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      return sortedMessages.map((message) => ({
        id: message.id,
        conversationId: conversation.id,
        direction: message.direction,
        channel: message.channel,
        body: message.body,
        bodyOriginal: message.body_original ?? '',
        langSrc: message.lang_src ?? '',
        langDest: message.lang_dest ?? '',
        templateId: message.templateId ?? '',
        templateName: message.template?.name ?? '',
        templateLocale: message.template?.locale ?? '',
        templateVersion: message.template?.version ?? '',
        mediaUrl: message.mediaUrl ?? '',
        status: message.status,
        errorCode: message.errorCode ?? '',
        sentAt: message.sentAt ? message.sentAt.toISOString() : '',
        deliveredAt: message.deliveredAt ? message.deliveredAt.toISOString() : '',
        readAt: message.readAt ? message.readAt.toISOString() : '',
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      }));
    });

    const sortedConsentLogs = [...contact.consentLogs].sort(
      (a, b) => a.grantedAt.getTime() - b.grantedAt.getTime()
    );

    const consentLogRecords = sortedConsentLogs.map((log) => ({
      id: log.id,
      scope: log.scope,
      channel: log.channel,
      grantedAt: log.grantedAt.toISOString(),
      revokedAt: log.revokedAt ? log.revokedAt.toISOString() : ''
    }));

    const auditLogRecords = auditLogs.map((log: AuditLogModel) => ({
      id: log.id,
      userId: log.userId ?? '',
      action: log.action,
      diff: log.diff ? JSON.stringify(log.diff) : '',
      ip: log.ip ?? '',
      createdAt: log.createdAt.toISOString()
    }));

    const csv = {
      contact: buildCsv([contactRecord], [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'locale', label: 'Locale' },
        { key: 'country', label: 'Country' },
        { key: 'timezone', label: 'Timezone' },
        { key: 'tags', label: 'Tags' },
        { key: 'consent', label: 'Consent JSON' }
      ]),
      leads: buildCsv(leadRecords, [
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
        { key: 'score', label: 'Score' },
        { key: 'source', label: 'Source' },
        { key: 'campaignId', label: 'Campaign ID' },
        { key: 'campaignName', label: 'Campaign Name' },
        { key: 'ownerId', label: 'Owner ID' },
        { key: 'ownerName', label: 'Owner Name' },
        { key: 'ownerEmail', label: 'Owner Email' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' }
      ]),
      conversations: buildCsv(conversationRecords, [
        { key: 'id', label: 'ID' },
        { key: 'channel', label: 'Channel' },
        { key: 'status', label: 'Status' },
        { key: 'assignedToId', label: 'Assigned To ID' },
        { key: 'assignedToName', label: 'Assigned To Name' },
        { key: 'assignedToEmail', label: 'Assigned To Email' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' }
      ]),
      messages: buildCsv(messageRecords, [
        { key: 'id', label: 'ID' },
        { key: 'conversationId', label: 'Conversation ID' },
        { key: 'direction', label: 'Direction' },
        { key: 'channel', label: 'Channel' },
        { key: 'body', label: 'Body' },
        { key: 'bodyOriginal', label: 'Body Original' },
        { key: 'langSrc', label: 'Language Source' },
        { key: 'langDest', label: 'Language Destination' },
        { key: 'templateId', label: 'Template ID' },
        { key: 'templateName', label: 'Template Name' },
        { key: 'templateLocale', label: 'Template Locale' },
        { key: 'templateVersion', label: 'Template Version' },
        { key: 'mediaUrl', label: 'Media URL' },
        { key: 'status', label: 'Status' },
        { key: 'errorCode', label: 'Error Code' },
        { key: 'sentAt', label: 'Sent At' },
        { key: 'deliveredAt', label: 'Delivered At' },
        { key: 'readAt', label: 'Read At' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' }
      ]),
      consentLogs: buildCsv(consentLogRecords, [
        { key: 'id', label: 'ID' },
        { key: 'scope', label: 'Scope' },
        { key: 'channel', label: 'Channel' },
        { key: 'grantedAt', label: 'Granted At' },
        { key: 'revokedAt', label: 'Revoked At' }
      ]),
      auditLogs: buildCsv(auditLogRecords, [
        { key: 'id', label: 'ID' },
        { key: 'userId', label: 'User ID' },
        { key: 'action', label: 'Action' },
        { key: 'diff', label: 'Diff' },
        { key: 'ip', label: 'IP Address' },
        { key: 'createdAt', label: 'Created At' }
      ])
    };

    return {
      contact: contactRecord,
      leads: leadRecords,
      conversations: conversationRecords,
      messages: messageRecords,
      consentLogs: consentLogRecords,
      auditLogs: auditLogRecords,
      csv
    };
  }
}

type CsvColumn<T extends Record<string, unknown>> = { key: keyof T; label: string };

function buildCsv<T extends Record<string, unknown>>(rows: T[], columns: CsvColumn<T>[]) {
  if (columns.length === 0) {
    return '';
  }

  const header = columns.map(({ label }) => escapeCsvValue(label)).join(',');

  if (rows.length === 0) {
    return header;
  }

  const lines = rows.map((row) =>
    columns
      .map(({ key }) => {
        const value = row[key];
        return escapeCsvValue(
          value === null || value === undefined
            ? ''
            : typeof value === 'string'
              ? value
              : String(value)
        );
      })
      .join(',')
  );

  return [header, ...lines].join('\n');
}

function escapeCsvValue(value: string) {
  const stringValue = value ?? '';
  if (stringValue === '') {
    return '""';
  }

  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

type AuditLogModel = {
  id: string;
  userId: string | null;
  action: string;
  diff: unknown;
  ip: string | null;
  createdAt: Date;
};
