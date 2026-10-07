import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ProjectsService } from './projects.service';
import { PlantingUnitsService } from '../planting-units/planting-units.service';
import { addTreeHistorySheet } from '../../common/utils/tree-history-sheet.util';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private plantingUnitsService: PlantingUnitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.projectsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID (includes its Gram Panchayats)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get aggregated plot/tree/carbon summary rolled up across every GP in this project' })
  getSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getSummary(id);
  }

  @Get(':id/report.xlsx')
  @ApiOperation({ summary: 'Download a Project-wise Excel report (summary + per-GP breakdown)' })
  async downloadReport(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { project, summary, gramPanchayats } = await this.projectsService.getReportData(id);

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 28 },
      { header: 'Value', key: 'value', width: 30 },
    ];
    summarySheet.getRow(1).font = { bold: true };
    [
      ['Project', project.name],
      ['Description', project.description || ''],
      ['Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN') : ''],
      ['End Date', project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN') : ''],
      ['', ''],
      ['Gram Panchayats', summary.gramPanchayatCount],
      ['Registered Farmers', summary.farmerCount],
      ['Total Plots', summary.totalPlots],
      ['Total Area (acres)', summary.totalAreaAcres],
      ['Total Living Trees', summary.totalTrees],
      ['Verified Net Credits (tCO2e)', summary.verifiedNetCredits],
      ['Pending Net Credits (tCO2e)', summary.pendingNetCredits],
      ['Total Net Credits (tCO2e)', summary.totalNetCredits],
    ].forEach((row) => summarySheet.addRow({ field: row[0], value: row[1] }));

    const gpSheet = workbook.addWorksheet('Gram Panchayats');
    gpSheet.columns = [
      { header: 'Gram Panchayat', key: 'gp', width: 22 },
      { header: 'LGD Code', key: 'lgdCode', width: 14 },
      { header: 'District', key: 'district', width: 16 },
      { header: 'Farmers', key: 'farmerCount', width: 12 },
      { header: 'Plots', key: 'totalPlots', width: 10 },
      { header: 'Area (acres)', key: 'totalAreaAcres', width: 14 },
      { header: 'Living Trees', key: 'totalTrees', width: 14 },
      { header: 'Verified Credits (tCO2e)', key: 'verifiedNetCredits', width: 20 },
      { header: 'Pending Credits (tCO2e)', key: 'pendingNetCredits', width: 20 },
    ];
    gpSheet.getRow(1).font = { bold: true };
    for (const gp of gramPanchayats) {
      gpSheet.addRow(gp);
    }

    addTreeHistorySheet(workbook, await this.plantingUnitsService.getHistoryRows({ projectId: id }));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="project-report-${project.name.replace(/\s+/g, '-')}-${Date.now()}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update project details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a project (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
