import { randomBytes } from "crypto";

export const FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 1000); // 1000 = 10%
export const MEMBERSHIP_DAYS = 30;
export const DAY_MS = 86_400_000;

export function split(grossMinor: number) {
  const feeMinor = Math.round((grossMinor * FEE_BPS) / 10_000);
  return { feeMinor, creatorMinor: grossMinor - feeMinor };
}
export const newReference = () => "ZUP-" + randomBytes(3).toString("hex").toUpperCase();

// Checks the real file signature instead of trusting the browser's claim.
export function detectImage(b: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}
