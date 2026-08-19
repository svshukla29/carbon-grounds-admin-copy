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
import { CropAreasService } from './crop-areas.service';
import { CreateCropAreaDto } from './dto/create-crop-area.dto';
import { UpdateCropAreaDto } from './dto/update-crop-area.dto';
import { BulkCreateCropAreasDto } from './dto/bulk-create-crop-areas.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Crop Areas')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('crop-areas')
export class CropAreasController {
  constructor(private cropAreasService: CropAreasService) {}

  @Get('instance/:instanceId')
  @ApiOperation({ summary: 'Get all crop areas for a farm plot' })
  findByInstance(@Param('instanceId', ParseUUIDPipe) instanceId: string) {
    return this.cropAreasService.findByInstance(instanceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a crop area by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropAreasService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Add a crop area to a farm plot' })
  create(@Body() dto: CreateCropAreaDto) {
    return this.cropAreasService.create(dto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Bulk-add crop areas to a farm plot' })
  bulkCreate(@Body() dto: BulkCreateCropAreasDto) {
    return this.cropAreasService.bulkCreate(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a crop area' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCropAreaDto) {
    return this.cropAreasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a crop area (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropAreasService.remove(id);
  }
}
