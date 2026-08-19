import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringChecklistController } from './monitoring-checklist.controller';
import { MonitoringChecklistService } from './monitoring-checklist.service';
import { MonitoringChecklistItem } from './entities/monitoring-checklist-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MonitoringChecklistItem])],
  controllers: [MonitoringChecklistController],
  providers: [MonitoringChecklistService],
  exports: [MonitoringChecklistService],
})
export class MonitoringChecklistModule {}
