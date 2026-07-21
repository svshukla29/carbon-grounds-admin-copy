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
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Farmers')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated farmers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'state', required: false })
  findAll(
    @CurrentUser() requester: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('state') state?: string,
  ) {
    if (requester?.type === 'farmer') {
      throw new ForbiddenException('Farmers cannot list other farmers');
    }
    return this.farmersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      state,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search farmers by name, ID, mobile or village' })
  @ApiQuery({ name: 'q', required: true })
  search(@CurrentUser() requester: any, @Query('q') q: string) {
    if (requester?.type === 'farmer') {
      throw new ForbiddenException('Farmers cannot search other farmers');
    }
    return this.farmersService.search(q || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a farmer by ID' })
  findOne(@CurrentUser() requester: any, @Param('id', ParseUUIDPipe) id: string) {
    if (requester?.type === 'farmer' && requester.id !== id) {
      throw new ForbiddenException('Farmers can only view their own profile');
    }
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
