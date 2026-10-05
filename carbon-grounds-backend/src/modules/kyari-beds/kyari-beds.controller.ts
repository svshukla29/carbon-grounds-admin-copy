import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KyariBedsService } from './kyari-beds.service';
import { CreateKyariBedDto } from './dto/create-kyari-bed.dto';
import { UpdateKyariBedDto } from './dto/update-kyari-bed.dto';
import { BulkCreateKyariBedsDto } from './dto/bulk-create-kyari-beds.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InstancesService } from '../instances/instances.service';

@ApiTags('Kyari Beds')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('kyari-beds')
export class KyariBedsController {
  constructor(
    private kyariBedsService: KyariBedsService,
    private instancesService: InstancesService,
  ) {}

  @Get('instance/:instanceId')
  @ApiOperation({ summary: 'Get all Kyari beds for a farm plot' })
  findByInstance(@Param('instanceId', ParseUUIDPipe) instanceId: string) {
    return this.kyariBedsService.findByInstance(instanceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Kyari bed by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.kyariBedsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a Kyari bed to a farm plot (farmers can add to their own plots; staff to any)' })
  async create(@CurrentUser() requester: any, @Body() dto: CreateKyariBedDto) {
    if (requester?.type === 'farmer') {
      const instance = await this.instancesService.findOne(dto.instanceId);
      if (instance?.farmerId !== requester.id) {
        throw new ForbiddenException('You can only add Kyari beds to your own farm plots');
      }
    } else if (
      ![UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER].includes(
        requester?.role,
      )
    ) {
      throw new ForbiddenException('Not allowed to add Kyari beds');
    }
    return this.kyariBedsService.create(dto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Bulk-add Kyari beds to a farm plot' })
  bulkCreate(@Body() dto: BulkCreateKyariBedsDto) {
    return this.kyariBedsService.bulkCreate(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a Kyari bed' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateKyariBedDto) {
    return this.kyariBedsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a Kyari bed (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.kyariBedsService.remove(id);
  }
}
