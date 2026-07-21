import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

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
          synchronize: true, // auto-create tables — set false in production after stable
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
  ],
})
export class AppModule {}
