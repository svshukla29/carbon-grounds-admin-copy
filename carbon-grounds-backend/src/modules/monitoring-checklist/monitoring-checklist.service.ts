import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringChecklistItem } from './entities/monitoring-checklist-item.entity';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { BulkUpdateChecklistDto } from './dto/bulk-update-checklist.dto';
import { DEFAULT_CHECKLIST_ITEMS } from './default-checklist-items';

@Injectable()
export class MonitoringChecklistService {
  constructor(
    @InjectRepository(MonitoringChecklistItem)
    private checklistRepo: Repository<MonitoringChecklistItem>,
  ) {}

  /** Returns the checklist for a period, lazily seeding the default items on first access */
  async getForPeriod(monitoringPeriodId: string): Promise<MonitoringChecklistItem[]> {
    const existing = await this.checklistRepo.find({
      where: { monitoringPeriodId },
      order: { sortOrder: 'ASC' },
    });
    if (existing.length > 0) return existing;

    const seeded = DEFAULT_CHECKLIST_ITEMS.map((label, index) =>
      this.checklistRepo.create({ monitoringPeriodId, label, sortOrder: index }),
    );
    return this.checklistRepo.save(seeded);
  }

  async updateItem(id: string, dto: UpdateChecklistItemDto): Promise<MonitoringChecklistItem> {
    const item = await this.checklistRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Checklist item #${id} not found`);
    Object.assign(item, dto);
    return this.checklistRepo.save(item);
  }

  async bulkUpdate(
    monitoringPeriodId: string,
    dto: BulkUpdateChecklistDto,
  ): Promise<MonitoringChecklistItem[]> {
    const items = await this.checklistRepo.find({ where: { monitoringPeriodId } });
    const itemsById = new Map(items.map((item) => [item.id, item]));

    const updated = dto.items.map((patch) => {
      const item = itemsById.get(patch.id);
      if (!item) {
        throw new BadRequestException(
          `Checklist item ${patch.id} does not belong to period ${monitoringPeriodId}`,
        );
      }
      item.completed = patch.completed;
      item.remarks = patch.remarks ?? null;
      return item;
    });

    return this.checklistRepo.save(updated);
  }
}
