import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { CreateMonitoringPeriodDto } from './dto/create-monitoring-period.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { MonitoringStatus } from './entities/monitoring-period.entity';

@ApiTags('Monitoring')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get()
  @ApiOperation({ summary: 'Get all monitoring periods' })
  @ApiQuery({ name: 'instanceId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: MonitoringStatus })
  findAll(
    @Query('instanceId') instanceId?: string,
    @Query('status') status?: MonitoringStatus,
  ) {
    return this.monitoringService.findAll({ instanceId, status });
  }

  @Get('pending-verification')
  @ApiOperation({ summary: 'Get monitoring periods pending verification' })
  getPending() {
    return this.monitoringService.getPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a monitoring period by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.monitoringService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a new monitoring period' })
  create(@Body() dto: CreateMonitoringPeriodDto) {
    return this.monitoringService.create(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update monitoring period status (review/approve/reject)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.monitoringService.updateStatus(id, dto);
  }
}
