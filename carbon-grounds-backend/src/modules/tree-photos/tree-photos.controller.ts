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
import { TreePhotosService } from './tree-photos.service';
import { CreateTreePhotoDto } from './dto/create-tree-photo.dto';
import { UpdateTreePhotoDto } from './dto/update-tree-photo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'tree-photos');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

@ApiTags('Tree Photos')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tree-photos')
export class TreePhotosController {
  constructor(private treePhotosService: TreePhotosService) {}

  @Get()
  @ApiOperation({ summary: 'Get tree photos (Tree Gallery), filterable and paginated' })
  @ApiQuery({ name: 'instanceId', required: false })
  @ApiQuery({ name: 'speciesId', required: false })
  @ApiQuery({ name: 'plantingUnitId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('instanceId') instanceId?: string,
    @Query('speciesId') speciesId?: string,
    @Query('plantingUnitId') plantingUnitId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.treePhotosService.findAll({
      instanceId,
      speciesId,
      plantingUnitId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('tree/:plantingUnitId')
  @ApiOperation({ summary: 'Get the full photo history for one tree' })
  findByTree(@Param('plantingUnitId', ParseUUIDPipe) plantingUnitId: string) {
    return this.treePhotosService.findByTree(plantingUnitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tree photo record by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.treePhotosService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Upload a dated photo for a tree' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        plantingUnitId: { type: 'string' },
        takenAt: { type: 'string' },
        monitoringPeriodId: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PNG, JPEG, and WEBP images are allowed'), false);
        }
      },
    }),
  )
  async upload(
    @Body() dto: CreateTreePhotoDto,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No photo uploaded');
    return this.treePhotosService.create(dto, file.filename, file.originalname, user?.id);
  }

  @Get('files/:filename')
  @ApiOperation({ summary: 'View a tree photo file' })
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a tree photo record (date/notes/period link)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTreePhotoDto) {
    return this.treePhotosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tree photo (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.treePhotosService.remove(id);
  }
}
