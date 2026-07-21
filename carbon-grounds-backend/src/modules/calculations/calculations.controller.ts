import { Controller, Get, Post, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CalculationsService } from './calculations.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Calculations')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(private calculationsService: CalculationsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregate carbon credit summary' })
  getSummary() {
    return this.calculationsService.getSummary();
  }

  @Get('instance/:instanceId')
  @ApiOperation({ summary: 'Get calculation history for an instance' })
  getByInstance(@Param('instanceId', ParseUUIDPipe) instanceId: string) {
    return this.calculationsService.getByInstance(instanceId);
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
}
