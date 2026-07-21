import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { FarmerJwtStrategy } from './strategies/farmer-jwt.strategy';
import { OtpVerification } from './entities/otp-verification.entity';
import { UsersModule } from '../users/users.module';
import { FarmersModule } from '../farmers/farmers.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // Secrets configured per-strategy via ConfigService
    TypeOrmModule.forFeature([OtpVerification]),
    UsersModule,
    FarmersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SmsService,
    JwtStrategy,
    JwtRefreshStrategy,
    FarmerJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
