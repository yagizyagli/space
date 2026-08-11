/**
 * Space
 * Core Interpolation Utilities
 *
 * General interpolation, easing, remapping, and smoothing helpers
 * used by simulations, animations, orbital calculations, and rendering.
 */

/* -------------------------------------------------------------------------- */
/* Linear interpolation                                                        */
/* -------------------------------------------------------------------------- */

export function lerp(
  start: number,
  end: number,
  amount: number
): number {
  return start + (end - start) * amount;
}

export function inverseLerp(
  start: number,
  end: number,
  value: number
): number {
  if (start === end) {
    return 0;
  }

  return (value - start) / (end - start);
}

export function remap(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const amount = inverseLerp(
    fromMin,
    fromMax,
    value
  );

  return lerp(toMin, toMax, amount);
}

export function remapClamped(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const amount = clamp(
    inverseLerp(fromMin, fromMax, value),
    0,
    1
  );

  return lerp(toMin, toMax, amount);
}

/* -------------------------------------------------------------------------- */
/* Clamping                                                                    */
/* -------------------------------------------------------------------------- */

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/* -------------------------------------------------------------------------- */
/* Smooth interpolation                                                        */
/* -------------------------------------------------------------------------- */

export function smoothstep(
  edge0: number,
  edge1: number,
  value: number
): number {
  const t = clamp(
    (value - edge0) / (edge1 - edge0),
    0,
    1
  );

  return t * t * (3 - 2 * t);
}

export function smootherstep(
  edge0: number,
  edge1: number,
  value: number
): number {
  const t = clamp(
    (value - edge0) / (edge1 - edge0),
    0,
    1
  );

  return (
    t *
    t *
    t *
    (t * (t * 6 - 15) + 10)
  );
}

/* -------------------------------------------------------------------------- */
/* Easing                                                                      */
/* -------------------------------------------------------------------------- */

export function easeInQuad(
  amount: number
): number {
  return amount * amount;
}

export function easeOutQuad(
  amount: number
): number {
  return amount * (2 - amount);
}

export function easeInOutQuad(
  amount: number
): number {
  return amount < 0.5
    ? 2 * amount * amount
    : 1 - Math.pow(-2 * amount + 2, 2) / 2;
}

export function easeInCubic(
  amount: number
): number {
  return amount * amount * amount;
}

export function easeOutCubic(
  amount: number
): number {
  return 1 - Math.pow(1 - amount, 3);
}

export function easeInOutCubic(
  amount: number
): number {
  return amount < 0.5
    ? 4 * amount * amount * amount
    : 1 - Math.pow(-2 * amount + 2, 3) / 2;
}

export function easeInQuart(
  amount: number
): number {
  return amount * amount * amount * amount;
}

export function easeOutQuart(
  amount: number
): number {
  return 1 - Math.pow(1 - amount, 4);
}

export function easeInOutQuart(
  amount: number
): number {
  return amount < 0.5
    ? 8 * Math.pow(amount, 4)
    : 1 - Math.pow(-2 * amount + 2, 4) / 2;
}

export function easeInSine(
  amount: number
): number {
  return 1 - Math.cos(
    (amount * Math.PI) / 2
  );
}

export function easeOutSine(
  amount: number
): number {
  return Math.sin(
    (amount * Math.PI) / 2
  );
}

export function easeInOutSine(
  amount: number
): number {
  return -(
    Math.cos(Math.PI * amount) - 1
  ) / 2;
}

/* -------------------------------------------------------------------------- */
/* Exponential easing                                                          */
/* -------------------------------------------------------------------------- */

export function easeInExpo(
  amount: number
): number {
  return amount === 0
    ? 0
    : Math.pow(2, 10 * amount - 10);
}

export function easeOutExpo(
  amount: number
): number {
  return amount === 1
    ? 1
    : 1 - Math.pow(2, -10 * amount);
}

export function easeInOutExpo(
  amount: number
): number {
  if (amount === 0 || amount === 1) {
    return amount;
  }

  return amount < 0.5
    ? Math.pow(2, 20 * amount - 10) / 2
    : (2 - Math.pow(2, -20 * amount + 10)) / 2;
}

/* -------------------------------------------------------------------------- */
/* Damping                                                                     */
/* -------------------------------------------------------------------------- */

export function damp(
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number
): number {
  const factor = 1 - Math.exp(
    -smoothing * deltaTime
  );

  return lerp(
    current,
    target,
    factor
  );
}

/* -------------------------------------------------------------------------- */
/* Step / quantization                                                         */
/* -------------------------------------------------------------------------- */

export function step(
  edge: number,
  value: number
): number {
  return value < edge ? 0 : 1;
}

export function quantize(
  value: number,
  stepSize: number
): number {
  if (stepSize === 0) {
    return value;
  }

  return Math.round(
    value / stepSize
  ) * stepSize;
}

/* -------------------------------------------------------------------------- */
/* Hermite interpolation                                                       */
/* -------------------------------------------------------------------------- */

export function hermite(
  p0: number,
  p1: number,
  tangent0: number,
  tangent1: number,
  amount: number
): number {
  const t = amount;
  const t2 = t * t;
  const t3 = t2 * t;

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - 2 * t2 + t;

  return (
    h00 * p0 +
    h10 * tangent0 +
    h01 * p1 +
    h11 * tangent1
  );
}

/* -------------------------------------------------------------------------- */
/* Catmull-Rom interpolation                                                   */
/* -------------------------------------------------------------------------- */

export function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  amount: number
): number {
  const t = amount;
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (
      2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Polynomial interpolation                                                    */
/* -------------------------------------------------------------------------- */

export function polynomial(
  values: readonly number[],
  amount: number
): number {
  if (values.length === 0) {
    return 0;
  }

  if (values.length === 1) {
    return values[0];
  }

  let result = 0;

  for (let i = 0; i < values.length; i++) {
    let term = values[i];

    for (let j = 0; j < values.length; j++) {
      if (i === j) {
        continue;
      }

      term *= (
        amount - j
      ) / (
        i - j
      );
    }

    result += term;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Time interpolation                                                          */
/* -------------------------------------------------------------------------- */

export function interpolateTime(
  startTime: number,
  endTime: number,
  amount: number
): number {
  return lerp(
    startTime,
    endTime,
    clamp(amount, 0, 1)
  );
}

/* -------------------------------------------------------------------------- */
/* Generic interpolation                                                       */
/* -------------------------------------------------------------------------- */

export function interpolate(
  start: number,
  end: number,
  amount: number,
  easing: (value: number) => number = (value) => value
): number {
  return lerp(
    start,
    end,
    easing(clamp(amount, 0, 1))
  );
}
