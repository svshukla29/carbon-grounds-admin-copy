import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import { CreateEcologicalZoneDto, UpdateEcologicalZoneDto } from './dto/ecological-zone.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Masters')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('masters')
export class MastersController {
  constructor(private mastersService: MastersService) {}

  @Get('dropdowns')
  @ApiOperation({ summary: 'Get dropdown options for forms' })
  getDropdowns() {
    return this.mastersService.getDropdowns();
  }

  @Get('tribes')
  @ApiOperation({ summary: 'Get tribes, optionally filtered by state / PVTG status' })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'pvtgOnly', required: false, type: Boolean })
  getTribes(
    @Query('state') state?: string,
    @Query('pvtgOnly') pvtgOnly?: string,
  ) {
    return this.mastersService.getTribes(state, pvtgOnly === 'true');
  }

  @Get('tribes/search')
  @ApiOperation({ summary: 'Search tribes by name' })
  @ApiQuery({ name: 'q', required: true })
  searchTribes(@Query('q') q: string) {
    return this.mastersService.searchTribes(q || '');
  }

  @Get('ipcc-constants')
  @ApiOperation({ summary: 'Get IPCC calculation constants' })
  getIpccConstants() {
    return this.mastersService.getIpccConstants();
  }

  @Get('ecological-zones')
  @ApiOperation({ summary: 'Get ecological zones with their root:shoot ratios' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getEcologicalZones(@Query('includeInactive') includeInactive?: string) {
    return this.mastersService.getEcologicalZones(includeInactive === 'true');
  }

  @Post('ecological-zones')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Add an ecological/climatic zone (e.g. a new IPCC zone)' })
  createEcologicalZone(@Body() dto: CreateEcologicalZoneDto) {
    return this.mastersService.createEcologicalZone(dto);
  }

  @Patch('ecological-zones/:id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Edit or deactivate an ecological/climatic zone' })
  updateEcologicalZone(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEcologicalZoneDto) {
    return this.mastersService.updateEcologicalZone(id, dto);
  }
}
