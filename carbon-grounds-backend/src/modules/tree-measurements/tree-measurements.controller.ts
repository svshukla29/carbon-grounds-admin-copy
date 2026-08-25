import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TreeMeasurementsService } from './tree-measurements.service';
import { CreateTreeMeasurementDto } from './dto/create-tree-measurement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { PlantingUnitsService } from '../planting-units/planting-units.service';

@ApiTags('Tree Measurements')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('tree-measurements')
export class TreeMeasurementsController {
  constructor(
    private measurementsService: TreeMeasurementsService,
    private plantingUnitsService: PlantingUnitsService,
  ) {}

  @Get('tree/:plantingUnitId')
  @ApiOperation({ summary: 'Get the full measurement history for one tree' })
  findByTree(@Param('plantingUnitId', ParseUUIDPipe) plantingUnitId: string) {
    return this.measurementsService.findByTree(plantingUnitId);
  }

  @Get()
  @ApiOperation({ summary: 'Staff overview: most recent monitoring-visit measurements across all farms' })
  findRecent(@CurrentUser() user: any) {
    if (![UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER].includes(user?.role)) {
      throw new ForbiddenException('Not allowed to view monitoring visits');
    }
    return this.measurementsService.findRecent();
  }

  @Post()
  @ApiOperation({ summary: 'Log a monitoring-visit measurement (farmers can log for their own trees; staff for any)' })
  async create(@Body() dto: CreateTreeMeasurementDto, @CurrentUser() user: any) {
    if (user?.type === 'farmer') {
      const unit = await this.plantingUnitsService.findOne(dto.plantingUnitId);
      if (unit.instance?.farmerId !== user.id) {
        throw new ForbiddenException('You can only log measurements for your own trees');
      }
    } else if (
      ![UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER].includes(user?.role)
    ) {
      throw new ForbiddenException('Not allowed to log tree measurements');
    }

    return this.measurementsService.create(dto, user?.type === 'farmer' ? undefined : user?.id);
  }
}
