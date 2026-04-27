import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { FarmerStatus } from './entities/farmer.entity';

@ApiTags('Farmers')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all farmers (with optional search/filter)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: FarmerStatus })
  @ApiQuery({ name: 'location', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: FarmerStatus,
    @Query('location') location?: string,
  ) {
    return this.farmersService.findAll({ search, status, location });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a farmer by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a new farmer' })
  create(@Body() dto: CreateFarmerDto) {
    return this.farmersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update farmer details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmerDto,
  ) {
    return this.farmersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a farmer (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmersService.remove(id);
  }
}
