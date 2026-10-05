import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CalculationsService } from './calculations.service';
import { InstancesService } from '../instances/instances.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RetireCalculationDto } from './dto/retire-calculation.dto';

@ApiTags('Calculations')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(
    private calculationsService: CalculationsService,
    private instancesService: InstancesService,
  ) {}

  @Get('my-summary')
  @ApiOperation({ summary: "Get the logged-in farmer's own carbon credit summary" })
  getMySummary(@CurrentUser() requester: any) {
    if (requester?.type !== 'farmer') {
      throw new ForbiddenException('This endpoint is for farmer accounts only');
    }
    return this.calculationsService.getSummaryForFarmer(requester.id);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get aggregate carbon credit summary (staff only)' })
  getSummary() {
    return this.calculationsService.getSummary();
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get the per-tree breakdown and formula readout for a calculation' })
  getDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.calculationsService.getDetails(id);
  }

  @Get('instance/:instanceId')
  @ApiOperation({ summary: 'Get calculation history for an instance (farmers can only view their own)' })
  async getByInstance(@CurrentUser() requester: any, @Param('instanceId', ParseUUIDPipe) instanceId: string) {
    if (requester?.type === 'farmer') {
      const instance = await this.instancesService.findOne(instanceId);
      if (instance?.farmerId !== requester.id) {
        throw new ForbiddenException('You can only view calculations for your own farm plots');
      }
    }
    return this.calculationsService.getByInstance(instanceId);
  }

  @Get('preview/:instanceId')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Preview what running a calculation would produce — inputs, formula and result — without saving anything' })
  preview(@Param('instanceId', ParseUUIDPipe) instanceId: string) {
    return this.calculationsService.preview(instanceId);
  }

  @Post('run/:instanceId/:periodId')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Run carbon stock & credit calculation for a monitoring period' })
  run(
    @Param('instanceId', ParseUUIDPipe) instanceId: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.calculationsService.run(instanceId, periodId);
  }

  @Patch(':id/retire')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Retire a calculation\'s credits (permanently used/cancelled)' })
  retire(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RetireCalculationDto) {
    return this.calculationsService.retire(id, dto.reason);
  }
}
