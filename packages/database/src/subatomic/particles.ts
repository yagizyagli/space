import { ICosmicEntity } from '../types/celestial.js';

export const subatomicParticles: ICosmicEntity[] = [
  {
    id: "electron_volt_quark",
    name: "Up Quark",
    scale: "subatomic",
    scaleExponent: -18, // 10^-18 meters
    radiusInMeters: 1e-18,
    massInKg: 3.9e-30
  },
  {
    id: "proton_core",
    name: "Proton",
    scale: "subatomic",
    scaleExponent: -15, // 10^-15 meters (1 femtometer)
    radiusInMeters: 8.4e-16,
    massInKg: 1.67262e-27
  }
];
