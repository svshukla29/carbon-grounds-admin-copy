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

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get aggregated plot/tree/carbon summary for a gram panchayat' })
  getSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.gramPanchayatService.getSummary(id);
  }

  @Get(':id/report.xlsx')
  @ApiOperation({ summary: 'Download a Gram-Panchayat-wise Excel report (summary + per-plot breakdown)' })
  async downloadReport(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { gp, summary, plots } = await this.gramPanchayatService.getReportData(id);

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 28 },
      { header: 'Value', key: 'value', width: 30 },
    ];
    summarySheet.getRow(1).font = { bold: true };
    [
      ['Gram Panchayat', gp.gpName],
      ['GP Code', gp.gpCode || ''],
      ['LGD Code', gp.lgdCode],
      ['State', gp.state],
      ['District', gp.district],
      ['Block', gp.block || ''],
      ['Sachiv Name', gp.sachivName || ''],
      ['Sachiv Phone', gp.sachivPhone || ''],
      ['', ''],
      ['Registered Farmers', summary.farmerCount],
      ['Total Plots', summary.totalPlots],
      ['Total Area (acres)', summary.totalAreaAcres],
      ['Total Living Trees', summary.totalTrees],
      ['Verified Net Credits (tCO2e)', summary.verifiedNetCredits],
      ['Pending Net Credits (tCO2e)', summary.pendingNetCredits],
      ['Total Net Credits (tCO2e)', summary.totalNetCredits],
    ].forEach((row) => summarySheet.addRow({ field: row[0], value: row[1] }));

    const plotsSheet = workbook.addWorksheet('Plots');
    plotsSheet.columns = [
      { header: 'Plot ID', key: 'instanceId', width: 18 },
      { header: 'Plot Name', key: 'plotName', width: 22 },
      { header: 'Farmer', key: 'farmerName', width: 20 },
      { header: 'Farmer Code', key: 'farmerCode', width: 14 },
      { header: 'Village', key: 'villageName', width: 18 },
      { header: 'Area (acres)', key: 'areaAcres', width: 14 },
      { header: 'Living Trees', key: 'treeCount', width: 14 },
      { header: 'Verified Net Credits (tCO2e)', key: 'verifiedNetCredits', width: 22 },
      { header: 'Pending Net Credits (tCO2e)', key: 'pendingNetCredits', width: 22 },
    ];
    plotsSheet.getRow(1).font = { bold: true };
    for (const plot of plots) {
      plotsSheet.addRow(plot);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gram-panchayat-report-${gp.gpCode || gp.id}-${Date.now()}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
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
