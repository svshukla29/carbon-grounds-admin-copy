import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KyariBedsController } from './kyari-beds.controller';
import { KyariBedsService } from './kyari-beds.service';
import { KyariBed } from './entities/kyari-bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KyariBed])],
  controllers: [KyariBedsController],
  providers: [KyariBedsService],
  exports: [KyariBedsService],
})
export class KyariBedsModule {}
