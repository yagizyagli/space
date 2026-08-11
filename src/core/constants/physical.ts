/**
 * Space
 * Physical Constants
 *
 * Fundamental physical constants used by the Space engine.
 *
 * SI units are used unless otherwise stated.
 *
 * Values follow commonly adopted CODATA / SI definitions.
 */

/* -------------------------------------------------------------------------- */
/* Fundamental constants                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Speed of light in vacuum.
 *
 * m/s
 */
export const SPEED_OF_LIGHT =
  299_792_458;

/**
 * Newtonian gravitational constant.
 *
 * m³ kg⁻¹ s⁻²
 */
export const GRAVITATIONAL_CONSTANT =
  6.67430e-11;

/**
 * Planck constant.
 *
 * J·s
 */
export const PLANCK_CONSTANT =
  6.62607015e-34;

/**
 * Reduced Planck constant (ℏ).
 *
 * J·s
 */
export const REDUCED_PLANCK_CONSTANT =
  1.054571817e-34;

/**
 * Boltzmann constant.
 *
 * J/K
 */
export const BOLTZMANN_CONSTANT =
  1.380649e-23;

/**
 * Avogadro constant.
 *
 * mol⁻¹
 */
export const AVOGADRO_CONSTANT =
  6.02214076e23;

/**
 * Elementary charge.
 *
 * C
 */
export const ELEMENTARY_CHARGE =
  1.602176634e-19;

/**
 * Vacuum permittivity.
 *
 * F/m
 */
export const VACUUM_PERMITTIVITY =
  8.8541878128e-12;

/**
 * Vacuum permeability.
 *
 * H/m
 */
export const VACUUM_PERMEABILITY =
  1.25663706212e-6;

/* -------------------------------------------------------------------------- */
/* Electromagnetic constants                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fine-structure constant.
 */
export const FINE_STRUCTURE_CONSTANT =
  7.2973525693e-3;

/**
 * Magnetic flux quantum.
 *
 * Wb
 */
export const MAGNETIC_FLUX_QUANTUM =
  2.067833848e-15;

/* -------------------------------------------------------------------------- */
/* Thermodynamic constants                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Stefan-Boltzmann constant.
 *
 * W m⁻² K⁻⁴
 */
export const STEFAN_BOLTZMANN_CONSTANT =
  5.670374419e-8;

/**
 * Wien displacement constant.
 *
 * m K
 */
export const WIEN_DISPLACEMENT_CONSTANT =
  2.897771955e-3;

/**
 * Molar gas constant.
 *
 * J mol⁻¹ K⁻¹
 */
export const GAS_CONSTANT =
  8.31446261815324;

/* -------------------------------------------------------------------------- */
/* Particle masses                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Electron mass.
 *
 * kg
 */
export const ELECTRON_MASS =
  9.1093837139e-31;

/**
 * Proton mass.
 *
 * kg
 */
export const PROTON_MASS =
  1.67262192595e-27;

/**
 * Neutron mass.
 *
 * kg
 */
export const NEUTRON_MASS =
  1.67492750056e-27;

/**
 * Atomic mass constant.
 *
 * kg
 */
export const ATOMIC_MASS_UNIT =
  1.66053906892e-27;

/* -------------------------------------------------------------------------- */
/* Earth-scale constants                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Standard gravitational acceleration at Earth surface.
 *
 * m/s²
 */
export const STANDARD_GRAVITY =
  9.80665;

/**
 * Nominal Earth equatorial radius.
 *
 * m
 */
export const EARTH_EQUATORIAL_RADIUS =
  6_378_137;

/**
 * Nominal Earth polar radius.
 *
 * m
 */
export const EARTH_POLAR_RADIUS =
  6_356_752.314245;

/**
 * Mean Earth radius.
 *
 * m
 */
export const EARTH_MEAN_RADIUS =
  6_371_008.8;

/**
 * Earth mass.
 *
 * kg
 */
export const EARTH_MASS =
  5.9722e24;

/**
 * Earth gravitational parameter GM.
 *
 * m³/s²
 */
export const EARTH_GRAVITATIONAL_PARAMETER =
  3.986004418e14;

/* -------------------------------------------------------------------------- */
/* Solar constants                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Nominal solar radius.
 *
 * m
 */
export const SOLAR_RADIUS =
  6.957e8;

/**
 * Solar mass.
 *
 * kg
 */
export const SOLAR_MASS =
  1.98847e30;

/**
 * Solar gravitational parameter GM.
 *
 * m³/s²
 */
export const SOLAR_GRAVITATIONAL_PARAMETER =
  1.32712440018e20;

/**
 * Nominal solar luminosity.
 *
 * W
 */
export const SOLAR_LUMINOSITY =
  3.828e26;

/**
 * Nominal solar effective temperature.
 *
 * K
 */
export const SOLAR_EFFECTIVE_TEMPERATURE =
  5_772;

/**
 * Solar constant at 1 AU.
 *
 * W/m²
 */
export const SOLAR_CONSTANT =
  1_361;

/* -------------------------------------------------------------------------- */
/* Lunar constants                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Mean lunar radius.
 *
 * m
 */
export const MOON_MEAN_RADIUS =
  1_737_400;

/**
 * Lunar mass.
 *
 * kg
 */
export const MOON_MASS =
  7.342e22;

/**
 * Lunar gravitational parameter GM.
 *
 * m³/s²
 */
export const MOON_GRAVITATIONAL_PARAMETER =
  4.9048695e12;

/* -------------------------------------------------------------------------- */
/* Universal dimensionless constants                                           */
/* -------------------------------------------------------------------------- */

/**
 * π.
 */
export const PI =
  Math.PI;

/**
 * 2π.
 */
export const TWO_PI =
  Math.PI * 2;

/**
 * Degrees to radians.
 */
export const DEG_TO_RAD =
  Math.PI / 180;

/**
 * Radians to degrees.
 */
export const RAD_TO_DEG =
  180 / Math.PI;

/* -------------------------------------------------------------------------- */
/* Constant collections                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Fundamental physics constants.
 */
export const PHYSICAL_CONSTANTS = {
  speedOfLight: SPEED_OF_LIGHT,
  gravitationalConstant: GRAVITATIONAL_CONSTANT,
  planck: PLANCK_CONSTANT,
  reducedPlanck: REDUCED_PLANCK_CONSTANT,
  boltzmann: BOLTZMANN_CONSTANT,
  avogadro: AVOGADRO_CONSTANT,
  elementaryCharge: ELEMENTARY_CHARGE,
  vacuumPermittivity: VACUUM_PERMITTIVITY,
  vacuumPermeability: VACUUM_PERMEABILITY,
  fineStructure: FINE_STRUCTURE_CONSTANT,
  stefanBoltzmann: STEFAN_BOLTZMANN_CONSTANT,
  wienDisplacement: WIEN_DISPLACEMENT_CONSTANT
} as const;

/**
 * Particle masses.
 */
export const PARTICLE_MASSES = {
  electron: ELECTRON_MASS,
  proton: PROTON_MASS,
  neutron: NEUTRON_MASS,
  atomicMassUnit: ATOMIC_MASS_UNIT
} as const;

/**
 * Solar constants.
 */
export const SOLAR_CONSTANTS = {
  radius: SOLAR_RADIUS,
  mass: SOLAR_MASS,
  gravitationalParameter:
    SOLAR_GRAVITATIONAL_PARAMETER,
  luminosity: SOLAR_LUMINOSITY,
  effectiveTemperature:
    SOLAR_EFFECTIVE_TEMPERATURE,
  irradianceAtOneAU: SOLAR_CONSTANT
} as const;

/**
 * Earth constants.
 */
export const EARTH_CONSTANTS = {
  equatorialRadius:
    EARTH_EQUATORIAL_RADIUS,
  polarRadius:
    EARTH_POLAR_RADIUS,
  meanRadius:
    EARTH_MEAN_RADIUS,
  mass:
    EARTH_MASS,
  gravitationalParameter:
    EARTH_GRAVITATIONAL_PARAMETER,
  standardGravity:
    STANDARD_GRAVITY
} as const;

/**
 * Moon constants.
 */
export const MOON_CONSTANTS = {
  radius: MOON_MEAN_RADIUS,
  mass: MOON_MASS,
  gravitationalParameter:
    MOON_GRAVITATIONAL_PARAMETER
} as const;
