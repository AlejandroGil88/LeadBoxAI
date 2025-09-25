import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto, LeadStatus } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';

const LEAD_INCLUDE = {
  contact: {
    select: {
      id: true,
      name: true,
      phone_e164: true,
      email: true,
      locale: true,
      country: true,
      tags: true
    }
  },
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
      name: true,
      status: true
    }
  }
} as const;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LeadQueryDto) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 25;

    const contactWhere: Record<string, any> = {};

    if (query.tag) {
      contactWhere.tags = { has: query.tag };
    }

    if (query.search) {
      contactWhere.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone_e164: { contains: query.search } }
      ];
    }

    const where: Record<string, any> = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(query.campaignId ? { campaignId: query.campaignId } : {}),
      ...(query.source
        ? { source: { contains: query.source, mode: 'insensitive' } }
        : {}),
      ...(Object.keys(contactWhere).length ? { contact: contactWhere } : {})
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: LEAD_INCLUDE
      }),
      this.prisma.lead.count({ where })
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
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: LEAD_INCLUDE
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    return lead;
  }

  async create(dto: CreateLeadDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const contact = await tx.contact.findUnique({
        where: { id: dto.contactId },
        select: { id: true, tags: true }
      });

      if (!contact) {
        throw new NotFoundException(`Contact ${dto.contactId} not found`);
      }

      if (dto.ownerId) {
        const ownerExists = await tx.user.findUnique({ where: { id: dto.ownerId } });
        if (!ownerExists) {
          throw new NotFoundException(`Owner ${dto.ownerId} not found`);
        }
      }

      if (dto.campaignId) {
        const campaignExists = await tx.campaign.findUnique({ where: { id: dto.campaignId } });
        if (!campaignExists) {
          throw new NotFoundException(`Campaign ${dto.campaignId} not found`);
        }
      }

      let contactTags = contact.tags ?? [];
      if (dto.tags?.length) {
        contactTags = Array.from(new Set([...contactTags, ...dto.tags]));
        await tx.contact.update({
          where: { id: contact.id },
          data: { tags: contactTags }
        });
      }

      const lead = await tx.lead.create({
        data: {
          contactId: dto.contactId,
          ownerId: dto.ownerId,
          source: dto.source,
          campaignId: dto.campaignId,
          status: dto.status ?? LeadStatus.Nuevo,
          score: dto.score ?? 0
        },
        include: LEAD_INCLUDE
      });

      if (dto.tags?.length) {
        lead.contact = { ...lead.contact, tags: contactTags };
      }

      return lead;
    });
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findUnique({
      where: { id },
      include: { contact: { select: { id: true, tags: true } } }
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    const data: Record<string, any> = {
      ...(dto.ownerId !== undefined
        ? {
            owner: dto.ownerId
              ? { connect: { id: dto.ownerId } }
              : { disconnect: true }
          }
        : {}),
      ...(dto.campaignId !== undefined
        ? {
            campaign: dto.campaignId
              ? { connect: { id: dto.campaignId } }
              : { disconnect: true }
          }
        : {}),
      ...(dto.source !== undefined ? { source: dto.source } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.score !== undefined ? { score: dto.score } : {})
    };

    if (dto.ownerId) {
      const ownerExists = await this.prisma.user.findUnique({ where: { id: dto.ownerId } });
      if (!ownerExists) {
        throw new NotFoundException(`Owner ${dto.ownerId} not found`);
      }
    }

    if (dto.campaignId) {
      const campaignExists = await this.prisma.campaign.findUnique({ where: { id: dto.campaignId } });
      if (!campaignExists) {
        throw new NotFoundException(`Campaign ${dto.campaignId} not found`);
      }
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedLead = await tx.lead.update({
        where: { id },
        data: data as any,
        include: LEAD_INCLUDE
      });

      if (dto.tags?.length) {
        const mergedTags = Array.from(
          new Set([...(existing.contact.tags ?? []), ...dto.tags])
        );
        const contact = await tx.contact.update({
          where: { id: existing.contact.id },
          data: { tags: mergedTags }
        });
        updatedLead.contact = { ...updatedLead.contact, tags: contact.tags };
      }

      return updatedLead;
    });
  }

  async assign(id: string, ownerId: string) {
    if (!ownerId) {
      throw new BadRequestException('ownerId is required');
    }

    const leadExists = await this.prisma.lead.findUnique({ where: { id } });
    if (!leadExists) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    const ownerExists = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!ownerExists) {
      throw new NotFoundException(`Owner ${ownerId} not found`);
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { owner: { connect: { id: ownerId } } },
      include: LEAD_INCLUDE
    });

    return updated;
  }

  async addTag(id: string, tag: string) {
    const normalized = tag?.trim();
    if (!normalized) {
      throw new BadRequestException('tag is required');
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { contact: { select: { id: true, tags: true } } }
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    const tags = Array.from(new Set([...(lead.contact.tags ?? []), normalized]));
    await this.prisma.contact.update({
      where: { id: lead.contact.id },
      data: { tags }
    });

    return this.findOne(id);
  }
}
