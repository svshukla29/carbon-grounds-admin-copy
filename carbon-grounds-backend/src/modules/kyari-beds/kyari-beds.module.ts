import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KyariBedsController } from './kyari-beds.controller';
import { KyariBedsService } from './kyari-beds.service';
import { KyariBed } from './entities/kyari-bed.entity';
import { InstancesModule } from '../instances/instances.module';

@Module({
  imports: [TypeOrmModule.forFeature([KyariBed]), InstancesModule],
  controllers: [KyariBedsController],
  providers: [KyariBedsService],
  exports: [KyariBedsService],
})
export class KyariBedsModule {}
