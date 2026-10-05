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
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { InstancesService } from './instances.service';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { FIELD_DATA_ROLES, Roles } from '../../common/decorators/roles.decorator';
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

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get aggregated tree/carbon summary for a single farm plot' })
  getSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.instancesService.getSummary(id);
  }

  @Get(':id/report.xlsx')
  @ApiOperation({ summary: 'Download an Instance-wise Excel report (plot details + calculation history)' })
  async downloadReport(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { instance, summary, calculations } = await this.instancesService.getReportData(id);

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 26 },
      { header: 'Value', key: 'value', width: 30 },
    ];
    summarySheet.getRow(1).font = { bold: true };
    [
      ['Plot ID', instance.instanceId],
      ['Plot Name', instance.plotName || ''],
      ['Farmer', instance.farmer?.farmerName || ''],
      ['Farmer Code', instance.farmer?.instanceId || ''],
      ['Village', instance.farmer?.villageName || ''],
      ['District', instance.farmer?.district || ''],
      ['State', instance.farmer?.state || ''],
      ['Area (acres)', instance.areaAcres],
      ['Land Use Type', instance.landUseType || ''],
      ['Ecological Zone', instance.ecologicalZone || ''],
      ['', ''],
      ['Total Trees', summary.totalTrees],
      ['Living Trees', summary.livingTrees],
      ['Dead Trees', summary.deadTrees],
      ['Lost Trees', summary.lostTrees],
      ['Replaced Trees', summary.replacedTrees],
      ['Verified Net Credits (tCO2e)', summary.verifiedNetCredits],
      ['Pending Net Credits (tCO2e)', summary.pendingNetCredits],
      ['Total Net Credits (tCO2e)', summary.totalNetCredits],
    ].forEach((row) => summarySheet.addRow({ field: row[0], value: row[1] }));

    const calcSheet = workbook.addWorksheet('Calculation History');
    calcSheet.columns = [
      { header: 'Period', key: 'period', width: 20 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'AGB Biomass (kg)', key: 'agbBiomass', width: 18 },
      { header: 'Carbon Stock (tC)', key: 'carbonStock', width: 18 },
      { header: 'CO2e (t)', key: 'co2e', width: 14 },
      { header: 'Net Credits (t)', key: 'netCredits', width: 16 },
      { header: 'Ecological Zone Used', key: 'zone', width: 22 },
      { header: 'Root:Shoot Ratio', key: 'rsr', width: 16 },
      { header: 'Monitoring Status', key: 'status', width: 16 },
      { header: 'Retired?', key: 'retired', width: 10 },
    ];
    calcSheet.getRow(1).font = { bold: true };
    for (const calc of calculations) {
      calcSheet.addRow({
        period: calc.period?.periodName || `Period ${calc.period?.periodNumber ?? '—'}`,
        date: new Date(calc.createdAt).toLocaleDateString('en-IN'),
        agbBiomass: Number(calc.agbBiomass).toFixed(2),
        carbonStock: Number(calc.carbonStock).toFixed(4),
        co2e: Number(calc.co2e).toFixed(4),
        netCredits: Number(calc.netCredits).toFixed(4),
        zone: calc.ecologicalZoneNameUsed || '',
        rsr: calc.rootShootRatioUsed ?? '',
        status: calc.period?.status || '',
        retired: calc.retiredAt ? 'Yes' : 'No',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="instance-report-${instance.instanceId}-${Date.now()}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post()
  @Roles(...FIELD_DATA_ROLES)
  @ApiOperation({ summary: 'Create a new farm plot (farmers can create their own; staff can create for any farmer)' })
  create(@CurrentUser() requester: any, @Body() dto: CreateInstanceDto) {
    if (requester?.type === 'farmer') {
      dto.farmerId = requester.id;
    } else if (
      ![UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER].includes(
        requester?.role,
      )
    ) {
      throw new ForbiddenException('Not allowed to create farm plots');
    }
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
