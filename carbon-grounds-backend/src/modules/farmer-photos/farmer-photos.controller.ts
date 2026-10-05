import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FarmerPhotosService } from './farmer-photos.service';
import { CreateFarmerPhotoDto } from './dto/create-farmer-photo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { safeUploadPath } from '../../common/utils/safe-file-path.util';
import { verifyFileSignature } from '../../common/utils/file-signature.util';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'farmer-photos');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

@ApiTags('Farmer Photos')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard(['jwt', 'jwt-farmer']), RolesGuard)
@Controller('farmer-photos')
export class FarmerPhotosController {
  constructor(private farmerPhotosService: FarmerPhotosService) {}

  @Get('farmer/:farmerId')
  @ApiOperation({ summary: 'Get the photo history for one farmer' })
  findByFarmer(@Param('farmerId', ParseUUIDPipe) farmerId: string) {
    return this.farmerPhotosService.findByFarmer(farmerId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a photo for a farmer (farmers can upload for themselves; staff for any)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        farmerId: { type: 'string' },
        takenAt: { type: 'string' },
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
    @Body() dto: CreateFarmerPhotoDto,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No photo uploaded');

    if (!verifyFileSignature(file.path, ['png', 'jpeg', 'webp'])) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('File content does not match an allowed image type');
    }

    if (user?.type === 'farmer') {
      dto.farmerId = user.id;
    } else if (
      ![UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER].includes(user?.role)
    ) {
      throw new ForbiddenException('Not allowed to upload farmer photos');
    }

    return this.farmerPhotosService.create(dto, file.filename, file.originalname, user?.type === 'farmer' ? undefined : user?.id);
  }

  @Get('files/:filename')
  @ApiOperation({ summary: 'View a farmer photo file' })
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = safeUploadPath(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }
}
