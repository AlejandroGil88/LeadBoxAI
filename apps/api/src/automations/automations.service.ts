import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.automation.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async create(dto: CreateAutomationDto) {
    const trigger = JSON.parse(JSON.stringify(dto.trigger));
    const actions = JSON.parse(JSON.stringify(dto.actions));

    return this.prisma.automation.create({
      data: {
        name: dto.name,
        trigger,
        actions,
        isActive: dto.isActive ?? true
      }
    });
  }

  async toggle(id: string, isActive: boolean) {
    const automation = await this.prisma.automation.findUnique({ where: { id } });

    if (!automation) {
      throw new NotFoundException(`Automation ${id} not found`);
    }

    return this.prisma.automation.update({
      where: { id },
      data: { isActive }
    });
  }
}
