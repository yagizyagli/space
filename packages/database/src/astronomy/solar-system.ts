import { IOrbitingEntity } from '../types/celestial.js';

export const solarSystemBodies: IOrbitingEntity[] = [
  {
    id: "earth_01",
    name: "Earth",
    scale: "celestial",
    scaleExponent: 7, // 10^7 meters order
    radiusInMeters: 6371000,
    massInKg: 5.972e24,
    orbitAroundId: "sun_01",
    orbitalElements: {
      semiMajorAxis: 1.0, // 1 AU
      eccentricity: 0.0167,
      inclination: 0.0,
      orbitalPeriodInDays: 365.256
    }
  }
];
