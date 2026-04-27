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

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM + RDS PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        database: config.get<string>('DB_NAME'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: true, // auto-create tables — set false in production after stable
        ssl: { rejectUnauthorized: false }, // Required for AWS RDS
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    UsersModule,
    FarmersModule,
    ProjectsModule,
    PartnersModule,
    ReportsModule,
    TeamsModule,
    DashboardModule,
  ],
})
export class AppModule {}
