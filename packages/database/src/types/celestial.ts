/**
 * Core dimensions of the universe used to categorize objects by order of magnitude.
 * E.g., SUBATOMIC (10^-15m to 10^-9m), CELESTIAL (Planets/Stars), COSMIC (Galaxies/Universe).
 */
export type CosmicScale = 'subatomic' | 'macro' | 'celestial' | 'deepspace';

/**
 * Base template for absolutely every single entity in the space library.
 */
export interface ICosmicEntity {
  id: string;
  name: string;
  scale: CosmicScale;
  scaleExponent: number; // The size in meters expressed as power of 10 (e.g., Earth = 7 for 10^7m)
  radiusInMeters: number; // Actual physical radius
  massInKg: number;      // Actual physical mass
}

/**
 * Specifically for objects that orbit around a central body (Planets, Moons, Satellites).
 */
export interface IOrbitingEntity extends ICosmicEntity {
  orbitAroundId: string; // The ID of the star or planet it orbits
  orbitalElements: {
    semiMajorAxis: number;  // Distance to center in Astronomical Units (AU) or meters
    eccentricity: number;    // Shape of the ellipse (0 = perfect circle, 0.9 = stretched)
    inclination: number;     // Orbital tilt in degrees
    orbitalPeriodInDays: number;
  };
}

/**
 * Specifically for light-emitting or extreme energy cosmic structures (Stars, Quasars, Black Holes).
 */
export interface IStellarEntity extends ICosmicEntity {
  stellarClass: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'blackhole' | 'quasar';
  luminosity: number;       // Solar luminosity units
  temperatureInKelvin: number;
  hasEventHorizon: boolean;
}
