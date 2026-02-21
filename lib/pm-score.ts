import type { PmModel } from "@/types/database";

/**
 * 퍼모위키 가성비 지수 계산
 * 공식: Math.round(((battery_capacity * 36) + motor_power_peak) / (original_price / 10000))
 */
export function calculateValueScore(model: {
  original_price?: number | null;
  battery_capacity?: number | null;
  motor_power_peak?: number | null;
}): number | null {
  const { original_price, battery_capacity, motor_power_peak } = model;

  if (
    original_price == null ||
    original_price === 0 ||
    battery_capacity == null ||
    battery_capacity === 0 ||
    motor_power_peak == null ||
    motor_power_peak === 0
  ) {
    return null;
  }

  const voltage = 36;
  const numerator = battery_capacity * voltage + motor_power_peak;
  const denominator = original_price / 10000;
  if (denominator === 0) return null;
  return Math.round(numerator / denominator);
}
