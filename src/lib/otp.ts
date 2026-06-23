import crypto from "crypto";
import bcrypt from "bcryptjs";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function compareOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

/** Remaining cooldown in seconds, or 0 if a resend is allowed. */
export function resendCooldownRemaining(lastSentAt: Date): number {
  const elapsed = Date.now() - lastSentAt.getTime();
  const remaining = RESEND_COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
