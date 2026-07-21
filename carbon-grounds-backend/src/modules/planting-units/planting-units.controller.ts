import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { PlantingUnitsService } from './planting-units.service';
import { CreatePlantingUnitDto } from './dto/create-planting-unit.dto';
import { UpdatePlantingUnitDto } from './dto/update-planting-unit.dto';
import { BulkCreatePlantingUnitsDto } from './dto/bulk-create-planting-units.dto';
import { MarkLossDto } from './dto/mark-loss.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Planting Units')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('planting-units')
export class PlantingUnitsController {
  constructor(private plantingUnitsService: PlantingUnitsService) {}

  @Get('instance/:instanceId')
  @ApiOperation({ summary: 'Get all planting units (trees) for a farm plot' })
  findByInstance(@Param('instanceId', ParseUUIDPipe) instanceId: string) {
    return this.plantingUnitsService.findByInstance(instanceId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export tree records with farmer & gram panchayat details to Excel' })
  @ApiQuery({ name: 'species', required: false, description: 'Filter by species common name (e.g. Mango)' })
  @ApiQuery({ name: 'instanceId', required: false, description: 'Filter by farm plot UUID' })
  async exportTrees(
    @Query('species') species: string | undefined,
    @Query('instanceId') instanceId: string | undefined,
    @Res() res: Response,
  ) {
    const units = await this.plantingUnitsService.exportTrees({ species, instanceId });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Trees');

    sheet.columns = [
      { header: 'Tree ID', key: 'treeId', width: 22 },
      { header: 'Species', key: 'species', width: 18 },
      { header: 'Scientific Name', key: 'scientificName', width: 22 },
      { header: 'DBH (cm)', key: 'dbhCm', width: 10 },
      { header: 'Height (m)', key: 'heightM', width: 10 },
      { header: 'Planting Date', key: 'plantingDate', width: 14 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Loss Date', key: 'lossDate', width: 14 },
      { header: 'Tree GPS Lat', key: 'treeLat', width: 12 },
      { header: 'Tree GPS Lng', key: 'treeLng', width: 12 },
      { header: 'Plot ID', key: 'plotId', width: 14 },
      { header: 'Plot Area (acres)', key: 'areaAcres', width: 16 },
      { header: 'Farmer ID', key: 'farmerInstanceId', width: 14 },
      { header: 'Farmer Name', key: 'farmerName', width: 22 },
      { header: 'Mobile No', key: 'mobileNo', width: 14 },
      { header: 'Village', key: 'villageName', width: 18 },
      { header: 'Block', key: 'block', width: 16 },
      { header: 'Tehsil', key: 'tehsil', width: 16 },
      { header: 'District', key: 'district', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Khasra No', key: 'khasraNo', width: 16 },
      { header: 'Gram Panchayat', key: 'gpName', width: 20 },
      { header: 'GP LGD Code', key: 'gpLgdCode', width: 14 },
      { header: 'GP Sachiv Name', key: 'sachivName', width: 18 },
      { header: 'GP Sachiv Phone', key: 'sachivPhone', width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const unit of units) {
      const farmer = unit.instance?.farmer;
      const gp = farmer?.gramPanchayat;
      sheet.addRow({
        treeId: unit.treeId,
        species: unit.species?.commonName || '',
        scientificName: unit.species?.scientificName || '',
        dbhCm: unit.dbhCm ?? '',
        heightM: unit.heightM ?? '',
        plantingDate: unit.plantingDate ? new Date(unit.plantingDate).toLocaleDateString('en-IN') : '',
        status: unit.lossDate ? 'Lost' : 'Alive',
        lossDate: unit.lossDate ? new Date(unit.lossDate).toLocaleDateString('en-IN') : '',
        treeLat: unit.gpsLat ?? '',
        treeLng: unit.gpsLng ?? '',
        plotId: unit.instance?.instanceId || '',
        areaAcres: unit.instance?.areaAcres ?? '',
        farmerInstanceId: farmer?.instanceId || '',
        farmerName: farmer?.farmerName || '',
        mobileNo: farmer?.mobileNo || '',
        villageName: farmer?.villageName || '',
        block: farmer?.block || '',
        tehsil: farmer?.tehsil || '',
        district: farmer?.district || '',
        state: farmer?.state || '',
        khasraNo: farmer?.khasraNo || '',
        gpName: gp?.gpName || '',
        gpLgdCode: gp?.lgdCode || '',
        sachivName: gp?.sachivName || '',
        sachivPhone: gp?.sachivPhone || '',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="trees-export-${Date.now()}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a planting unit by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plantingUnitsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a new planting unit (tree)' })
  create(@Body() dto: CreatePlantingUnitDto) {
    return this.plantingUnitsService.create(dto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Bulk-create planting units for a farm plot' })
  bulkCreate(@Body() dto: BulkCreatePlantingUnitsDto) {
    return this.plantingUnitsService.bulkCreate(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a planting unit' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlantingUnitDto,
  ) {
    return this.plantingUnitsService.update(id, dto);
  }

  @Patch(':id/loss')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Record a tree as lost' })
  markLoss(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkLossDto,
  ) {
    return this.plantingUnitsService.markLoss(id, dto);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Restore a tree marked as lost back to alive' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.plantingUnitsService.restoreAlive(id);
  }
}
