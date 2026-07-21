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
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InstancesService } from './instances.service';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Instances')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('instances')
export class InstancesController {
  constructor(private instancesService: InstancesService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated farm plots' })
  @ApiQuery({ name: 'farmerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() requester: any,
    @Query('farmerId') farmerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // A farmer can only ever see their own plots — ignore any client-supplied farmerId.
    const scopedFarmerId = requester?.type === 'farmer' ? requester.id : farmerId;
    return this.instancesService.findAll({
      farmerId: scopedFarmerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('map/all')
  @ApiOperation({ summary: 'Get all plot boundaries as a GeoJSON FeatureCollection' })
  getAllGeoJson() {
    return this.instancesService.getAllGeoJson();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a farm plot by ID (with farmer & planting units)' })
  async findOne(@CurrentUser() requester: any, @Param('id', ParseUUIDPipe) id: string) {
    const instance = await this.instancesService.findOne(id);
    if (requester?.type === 'farmer' && instance?.farmerId !== requester.id) {
      throw new ForbiddenException('You can only view your own farm plots');
    }
    return instance;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a new farm plot' })
  create(@Body() dto: CreateInstanceDto) {
    return this.instancesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update farm plot details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstanceDto,
  ) {
    return this.instancesService.update(id, dto);
  }
}
