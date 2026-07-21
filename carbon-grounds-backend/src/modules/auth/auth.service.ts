import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { FarmersService } from '../farmers/farmers.service';
import { LoginDto } from './dto/login.dto';
import { OtpVerification } from './entities/otp-verification.entity';
import { SmsService } from './sms.service';

const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const SIGNUP_TOKEN_PURPOSE = 'farmer-signup';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private farmersService: FarmersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private smsService: SmsService,
    @InjectRepository(OtpVerification)
    private otpRepo: Repository<OtpVerification>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password: _p, refreshToken: _rt, ...userResponse } = user;

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Access denied — invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET')!;
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    const accessExpiry = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiry as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiry as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // ── Farmer OTP auth ──────────────────────────────────────────────────────

  async sendOtp(mobile: string): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.otpRepo.delete({ mobile });
    await this.otpRepo.save(
      this.otpRepo.create({
        mobile,
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      }),
    );

    await this.smsService.sendOtp(mobile, otp);
    return { message: 'OTP sent' };
  }

  async verifyOtp(mobile: string, otp: string) {
    const record = await this.otpRepo.findOne({
      where: { mobile },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired or not requested — please request a new one');
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await this.otpRepo.delete({ id: record.id });
      throw new UnauthorizedException('Too many incorrect attempts — please request a new OTP');
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await this.otpRepo.increment({ id: record.id }, 'attempts', 1);
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpRepo.delete({ id: record.id });

    const farmer = await this.farmersService.findByMobile(mobile);
    if (!farmer) {
      const signupToken = await this.jwtService.signAsync(
        { mobile, purpose: SIGNUP_TOKEN_PURPOSE },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET')!,
          expiresIn: '15m',
        },
      );
      return { needsSignup: true, signupToken };
    }

    const accessToken = await this.generateFarmerAccessToken(farmer.id, farmer.mobileNo);
    return { needsSignup: false, accessToken, farmer: this.sanitizeFarmer(farmer) };
  }

  async completeFarmerSignup(signupToken: string, name: string, village: string) {
    let payload: { mobile: string; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync(signupToken, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET')!,
      });
    } catch {
      throw new UnauthorizedException('Signup session expired — please verify your mobile number again');
    }

    if (payload.purpose !== SIGNUP_TOKEN_PURPOSE) {
      throw new UnauthorizedException('Invalid signup token');
    }

    const existing = await this.farmersService.findByMobile(payload.mobile);
    if (existing) {
      throw new BadRequestException('This mobile number is already registered — please login instead');
    }

    const farmer = await this.farmersService.createFromSignup(payload.mobile, name, village);
    const accessToken = await this.generateFarmerAccessToken(farmer.id, farmer.mobileNo);
    return { accessToken, farmer: this.sanitizeFarmer(farmer) };
  }

  private generateFarmerAccessToken(farmerId: string, mobile: string) {
    return this.jwtService.signAsync(
      { sub: farmerId, mobile, type: 'farmer' },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET')!,
        expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as any,
      },
    );
  }

  private sanitizeFarmer(farmer: {
    id: string;
    farmerName: string;
    mobileNo: string;
    villageName: string;
    district?: string;
    state?: string;
    status: string;
  }) {
    return {
      id: farmer.id,
      name: farmer.farmerName,
      mobile: farmer.mobileNo,
      village: farmer.villageName,
      district: farmer.district,
      state: farmer.state,
      status: farmer.status,
    };
  }
}
