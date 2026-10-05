import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']))
@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('states')
  @ApiOperation({ summary: 'Get all states' })
  getStates() {
    return this.locationsService.getStates();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get districts, optionally filtered by state name' })
  @ApiQuery({ name: 'state', required: false })
  getDistricts(@Query('state') state?: string) {
    return this.locationsService.getDistricts(state);
  }

  @Get('villages')
  @ApiOperation({ summary: 'Get villages, optionally filtered by district name' })
  @ApiQuery({ name: 'district', required: false })
  getVillages(@Query('district') district?: string) {
    return this.locationsService.getVillages(district);
  }
}
