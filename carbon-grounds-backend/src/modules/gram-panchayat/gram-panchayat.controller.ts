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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GramPanchayatService } from './gram-panchayat.service';
import { CreateGramPanchayatDto } from './dto/create-gram-panchayat.dto';
import { UpdateGramPanchayatDto } from './dto/update-gram-panchayat.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Gram Panchayat')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('gram-panchayat')
export class GramPanchayatController {
  constructor(private gramPanchayatService: GramPanchayatService) {}

  @Get()
  @ApiOperation({ summary: 'Get all gram panchayats' })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'state', required: false })
  findAll(
    @Query('district') district?: string,
    @Query('state') state?: string,
  ) {
    return this.gramPanchayatService.findAll({ district, state });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search gram panchayats by name or LGD code' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') q: string) {
    return this.gramPanchayatService.search(q || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gram panchayat by ID (with farmers)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gramPanchayatService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a new gram panchayat' })
  create(@Body() dto: CreateGramPanchayatDto) {
    return this.gramPanchayatService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update gram panchayat details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGramPanchayatDto,
  ) {
    return this.gramPanchayatService.update(id, dto);
  }
}
