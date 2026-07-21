import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MastersService } from './masters.service';

@ApiTags('Masters')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('masters')
export class MastersController {
  constructor(private mastersService: MastersService) {}

  @Get('dropdowns')
  @ApiOperation({ summary: 'Get static dropdown options for forms' })
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
}
