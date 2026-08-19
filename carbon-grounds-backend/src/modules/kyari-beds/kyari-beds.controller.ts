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

@ApiTags('Kyari Beds')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('kyari-beds')
export class KyariBedsController {
  constructor(private kyariBedsService: KyariBedsService) {}

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
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Add a Kyari bed to a farm plot' })
  create(@Body() dto: CreateKyariBedDto) {
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
