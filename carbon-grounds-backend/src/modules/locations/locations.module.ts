import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Village } from './entities/village.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State, District, Village])],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
