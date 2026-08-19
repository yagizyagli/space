// packages/database/src/subatomic/particles.ts
export const subatomicParticles = [
  {
    id: "electron_volt_quark",
    name: "Up Quark",
    scale: "subatomic",
    scaleExponent: -18,
    radiusInMeters: 1e-18,
    massInKg: 3.9e-30,
    visuals: { baseColor: "#ff5555" }
  },
  {
    id: "proton_core",
    name: "Proton",
    scale: "subatomic",
    scaleExponent: -15,
    radiusInMeters: 8.4e-16,
    massInKg: 1.67262e-27,
    visuals: { baseColor: "#55ff55" }
  }
];

// packages/database/src/astronomy/solar-system.ts
export const solarSystemBodies = [
  {
    id: "earth_01",
    name: "Earth",
    scale: "celestial",
    scaleExponent: 7,
    radiusInMeters: 6371000,
    massInKg: 5.972e24,
    orbitAroundId: "sun_01",
    orbitalElements: {
      semiMajorAxis: 1.0,
      eccentricity: 0.0167,
      inclination: 0.0,
      orbitalPeriodInDays: 365.256
    },
    visuals: { baseColor: "#2b82c9" }
  }
];

// packages/database/src/astronomy/deep-space.ts
export const deepSpaceEntities = [
  {
    id: "sagittarius_a_star",
    name: "Sagittarius A*",
    scale: "deepspace",
    scaleExponent: 10,
    radiusInMeters: 1.2e10,
    massInKg: 8.15e36,
    stellarClass: "blackhole",
    luminosity: 0,
    temperatureInKelvin: 0,
    hasEventHorizon: true,
    visuals: { baseColor: "#ffaa00" }
  }
];
