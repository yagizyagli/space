/**
 * Space
 * Core Angle Mathematics
 *
 * Angle utilities used throughout astronomy, coordinates,
 * orbital mechanics, and visualization.
 */

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function degreesToRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export function radiansToDegrees(radians: number): number {
  return radians * RAD_TO_DEG;
}

export function normalizeDegrees(degrees: number): number {
  const normalized = degrees % 360;

  return normalized < 0
    ? normalized + 360
    : normalized;
}

export function normalizeRadians(radians: number): number {
  const twoPi = Math.PI * 2;
  const normalized = radians % twoPi;

  return normalized < 0
    ? normalized + twoPi
    : normalized;
}

export function clampAngleRadians(
  radians: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, radians));
}

export function clampAngleDegrees(
  degrees: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, degrees));
}

export function shortestAngleDifferenceDegrees(
  from: number,
  to: number
): number {
  return ((to - from + 540) % 360) - 180;
}

export function shortestAngleDifferenceRadians(
  from: number,
  to: number
): number {
  const twoPi = Math.PI * 2;

  return (
    ((to - from + 3 * Math.PI) % twoPi) -
    Math.PI
  );
}

export function degreesToDMS(degrees: number): {
  degrees: number;
  minutes: number;
  seconds: number;
  sign: 1 | -1;
} {
  const sign: 1 | -1 = degrees < 0 ? -1 : 1;
  const absolute = Math.abs(degrees);

  const wholeDegrees = Math.floor(absolute);
  const minuteValue = (absolute - wholeDegrees) * 60;
  const minutes = Math.floor(minuteValue);
  const seconds = (minuteValue - minutes) * 60;

  return {
    degrees: wholeDegrees,
    minutes,
    seconds,
    sign
  };
}

export function dmsToDegrees(
  degrees: number,
  minutes = 0,
  seconds = 0
): number {
  const sign = degrees < 0 ? -1 : 1;

  return sign * (
    Math.abs(degrees) +
    Math.abs(minutes) / 60 +
    Math.abs(seconds) / 3600
  );
}

export function hoursToDegrees(hours: number): number {
  return hours * 15;
}

export function degreesToHours(degrees: number): number {
  return degrees / 15;
}

export function hoursToRadians(hours: number): number {
  return hours * Math.PI / 12;
}

export function radiansToHours(radians: number): number {
  return radians * 12 / Math.PI;
}

export function normalizeHours(hours: number): number {
  const normalized = hours % 24;

  return normalized < 0
    ? normalized + 24
    : normalized;
}

export function isAngleBetween(
  angle: number,
  start: number,
  end: number
): boolean {
  const normalizedAngle = normalizeDegrees(angle);
  const normalizedStart = normalizeDegrees(start);
  const normalizedEnd = normalizeDegrees(end);

  if (normalizedStart <= normalizedEnd) {
    return (
      normalizedAngle >= normalizedStart &&
      normalizedAngle <= normalizedEnd
    );
  }

  return (
    normalizedAngle >= normalizedStart ||
    normalizedAngle <= normalizedEnd
  );
}

export function lerpAngleDegrees(
  from: number,
  to: number,
  amount: number
): number {
  const difference = shortestAngleDifferenceDegrees(from, to);

  return normalizeDegrees(
    from + difference * amount
  );
}

export function lerpAngleRadians(
  from: number,
  to: number,
  amount: number
): number {
  const difference = shortestAngleDifferenceRadians(from, to);

  return normalizeRadians(
    from + difference * amount
  );
}
