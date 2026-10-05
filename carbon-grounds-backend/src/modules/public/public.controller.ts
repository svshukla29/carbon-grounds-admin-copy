import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';

// Deliberately has NO @UseGuards — this controller is the one intentional,
// narrowly-scoped exception to the rest of the API being authenticated.
@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Org-wide aggregate stats for the public summary page — no PII' })
  getSummary() {
    return this.publicService.getSummary();
  }
}
