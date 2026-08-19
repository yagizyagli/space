import { IStellarEntity } from '../types/celestial.js';

export const deepSpaceEntities: IStellarEntity[] = [
  {
    id: "sagittarius_a_star",
    name: "Sagittarius A*",
    scale: "deepspace",
    scaleExponent: 10, // 10^10 meters order
    radiusInMeters: 1.2e10,
    massInKg: 8.15e36, // ~4.1 million solar masses
    stellarClass: "blackhole",
    luminosity: 0,
    temperatureInKelvin: 0,
    hasEventHorizon: true
  }
];
