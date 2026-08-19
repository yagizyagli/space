import { IOrbitingEntity } from '@space/database';

/**
 * High-precision solvers for space orbital mechanics and astrophysical events.
 */
export class KeplerianSolver {
  private static readonly GRAVITATIONAL_CONSTANT = 6.6743e-11; // m^3 kg^-1 s^-2
  private static readonly SPEED_OF_LIGHT = 299792458; // m/s

  /**
   * Computes the current 2D positional vector (x, y) of an entity in its orbit based on elapsed time.
   * Uses Kepler's Equation: M = E - e*sin(E) solved via Newton-Raphson iteration.
   * 
   * @param body The orbiting celestial body with structural orbital elements
   * @param timeInSeconds Time elapsed since periapsis passage
   * @returns {{x: number, y: number}} Local orbital coordinates in meters
   */
  public static computeOrbitalPosition(body: IOrbitingEntity, timeInSeconds: number): { x: number; y: number } {
    const a = body.orbitalElements.semiMajorAxis * 1.496e11; // Convert AU to meters
    const e = body.orbitalElements.eccentricity;
    
    // Mean anomaly (M)
    const periodInSeconds = body.orbitalElements.orbitalPeriodInDays * 86400;
    const meanMotion = (2 * Math.PI) / periodInSeconds;
    const meanAnomaly = (meanMotion * timeInSeconds) % (2 * Math.PI);

    // Newton-Raphson iteration to find Eccentric Anomaly (E)
    let eccentricAnomaly = meanAnomaly;
    const tolerance = 1e-8;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const deltaE = (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - e * Math.cos(eccentricAnomaly));
      eccentricAnomaly -= deltaE;
      if (Math.abs(deltaE) < tolerance) break;
    }

    // Calculate coordinates in orbital plane
    const x = a * (Math.cos(eccentricAnomaly) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);

    return { x, y };
  }

  /**
   * Calculates the gravitational time dilation factor near an extreme mass (Einstein's General Relativity).
   * t' = t * sqrt(1 - rs/r) where rs is Schwarzschild radius.
   * 
   * @param massInKg Mass of the central heavy entity (e.g., Black hole)
   * @param distanceInMeters Distance from the singularity center
   * @returns {number} Time dilation coefficient (e.g., 1.0 = normal time, 2.0 = 1s feels like 2s outside)
   */
  public static calculateGravitationalTimeDilation(massInKg: number, distanceInMeters: number): number {
    // rs = 2GM / c^2
    const schwarzschildRadius = (2 * this.GRAVITATIONAL_CONSTANT * massInKg) / Math.pow(this.SPEED_OF_LIGHT, 2);
    
    if (distanceInMeters <= schwarzschildRadius) {
      return Infinity; // Inside event horizon, time mathematically stops relative to outer observer
    }

    return 1 / Math.sqrt(1 - (schwarzschildRadius / distanceInMeters));
  }
}
