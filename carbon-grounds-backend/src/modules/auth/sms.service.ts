import { Injectable, Logger } from '@nestjs/common';

/**
 * No SMS provider is wired up yet. Swap the body of sendOtp() for a real
 * provider (e.g. MSG91, Twilio) once credentials are available — until then
 * OTPs are only visible in the server logs, so login only works from a
 * machine that can see this console.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtp(mobile: string, otp: string): Promise<void> {
    this.logger.warn(`[DEV — no SMS provider configured] OTP for +91${mobile}: ${otp}`);
  }
}
