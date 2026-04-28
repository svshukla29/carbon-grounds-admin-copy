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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import type { File as MulterFile } from 'multer';
import * as fs from 'fs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ReportStatus } from './entities/report.entity';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'reports');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: ReportStatus,
    @Query('projectId') projectId?: string,
  ) {
    return this.reportsService.findAll({ search, status, projectId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.ANALYST)
  @ApiOperation({ summary: 'Create a new report' })
  create(@Body() dto: CreateReportDto, @CurrentUser() user: any) {
    return this.reportsService.create(dto, user.id);
  }

  @Post(':id/upload')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.ANALYST)
  @ApiOperation({ summary: 'Upload a file attachment to a report' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
      fileFilter: (req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/png',
          'image/jpeg',
          'image/jpg',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only PDF, Word, Excel, and image files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const fileUrl = `/reports/files/${file.filename}`;
    return this.reportsService.attachFile(id, fileUrl, file.originalname);
  }

  @Get('files/:filename')
  @ApiOperation({ summary: 'Download / view a report attachment' })
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.ANALYST)
  @ApiOperation({ summary: 'Update a report' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a report (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.remove(id);
  }
}
