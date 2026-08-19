import { Controller, Get, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MonitoringChecklistService } from './monitoring-checklist.service';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { BulkUpdateChecklistDto } from './dto/bulk-update-checklist.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Monitoring Checklist')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('monitoring-checklist')
export class MonitoringChecklistController {
  constructor(private monitoringChecklistService: MonitoringChecklistService) {}

  @Get('period/:periodId')
  @ApiOperation({ summary: 'Get the checklist for a monitoring period (auto-seeds defaults if empty)' })
  getForPeriod(@Param('periodId', ParseUUIDPipe) periodId: string) {
    return this.monitoringChecklistService.getForPeriod(periodId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a single checklist item' })
  updateItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateChecklistItemDto) {
    return this.monitoringChecklistService.updateItem(id, dto);
  }

  @Patch('period/:periodId/bulk')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Save all checklist items for a monitoring period in one request' })
  bulkUpdate(
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @Body() dto: BulkUpdateChecklistDto,
  ) {
    return this.monitoringChecklistService.bulkUpdate(periodId, dto);
  }
}
