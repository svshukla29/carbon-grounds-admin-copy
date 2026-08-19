import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt-farmer'))
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('all')
  @ApiOperation({
    summary: 'Push a batch of offline-collected plots and trees for the logged-in farmer',
  })
  syncAll(@CurrentUser() farmer: any, @Body() dto: SyncBatchDto) {
    return this.syncService.syncBatch(farmer.id, dto);
  }
}
