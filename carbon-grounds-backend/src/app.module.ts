import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FarmersModule } from './modules/farmers/farmers.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PartnersModule } from './modules/partners/partners.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TeamsModule } from './modules/teams/teams.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GramPanchayatModule } from './modules/gram-panchayat/gram-panchayat.module';
import { MastersModule } from './modules/masters/masters.module';
import { SpeciesModule } from './modules/species/species.module';
import { InstancesModule } from './modules/instances/instances.module';
import { PlantingUnitsModule } from './modules/planting-units/planting-units.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { KyariBedsModule } from './modules/kyari-beds/kyari-beds.module';
import { CropAreasModule } from './modules/crop-areas/crop-areas.module';
import { TreePhotosModule } from './modules/tree-photos/tree-photos.module';
import { TreeMeasurementsModule } from './modules/tree-measurements/tree-measurements.module';
import { MonitoringChecklistModule } from './modules/monitoring-checklist/monitoring-checklist.module';
import { SyncModule } from './modules/sync/sync.module';
import { FarmerPhotosModule } from './modules/farmer-photos/farmer-photos.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Generous global backstop (dashboard pages fire several parallel calls
    // per navigation) — sensitive routes like login tighten this further
    // with @Throttle().
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 200 }]),

    // TypeORM + RDS PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isLocal = config.get<string>('DB_HOST') === 'localhost';
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
          // Off by default: on a live DB, synchronize silently drops columns
          // removed from an entity. Set DB_SYNCHRONIZE=true only for a
          // throwaway local DB, or for one deliberate run after a backup.
          synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
          ssl: isLocal ? false : { rejectUnauthorized: false }, // SSL only for AWS RDS
          logging: config.get<string>('NODE_ENV') === 'development',
        };
      },
    }),

    AuthModule,
    UsersModule,
    FarmersModule,
    ProjectsModule,
    PartnersModule,
    ReportsModule,
    TeamsModule,
    DashboardModule,
    GramPanchayatModule,
    MastersModule,
    SpeciesModule,
    InstancesModule,
    PlantingUnitsModule,
    MonitoringModule,
    CalculationsModule,
    KyariBedsModule,
    CropAreasModule,
    TreePhotosModule,
    TreeMeasurementsModule,
    MonitoringChecklistModule,
    SyncModule,
    FarmerPhotosModule,
    LocationsModule,
    PublicModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
