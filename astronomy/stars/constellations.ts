/**
 * Space
 * Astronomy — Constellations
 *
 * IAU-style constellation model and lookup utilities.
 *
 * Coordinate convention:
 * - Right ascension: degrees [0, 360)
 * - Declination: degrees [-90, 90]
 *
 * This module intentionally does not contain a complete external
 * star-boundary dataset. Boundary datasets can be supplied through
 * the data layer and queried with the utilities provided here.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface Constellation {
  id:
    string;

  name:
    string;

  abbreviation:
    string;

  rightAscension:
    number;

  declination:
    number;

  areaSquareDegrees?:
    number;

  hemisphere?:
    "northern" |
    "southern" |
    "equatorial";

  description?:
    string;

  brightestStarId?:
    string;

  majorStars?:
    readonly string[];
}

export interface ConstellationBoundaryPoint {
  rightAscension:
    number;

  declination:
    number;
}

export interface ConstellationBoundary {
  constellationId:
    string;

  points:
    readonly ConstellationBoundaryPoint[];
}

export interface ConstellationMatch {
  constellation:
    Constellation;

  angularDistanceDegrees:
    number;
}

export interface ConstellationSearchOptions {
  name?:
    string;

  abbreviation?:
    string;

  hemisphere?:
    Constellation[
      "hemisphere"
    ];

  limit?:
    number;
}

/* -------------------------------------------------------------------------- */
/* Standard Constellation Names                                               */
/* -------------------------------------------------------------------------- */

export const CONSTELLATION_NAMES:
  Readonly<
    Record<
      string,
      string
    >
  > = {
  AND:
    "Andromeda",

  ANT:
    "Antlia",

  APS:
    "Apus",

  AQR:
    "Aquarius",

  AQL:
    "Aquila",

  ARA:
    "Ara",

  ARI:
    "Aries",

  AUR:
    "Auriga",

  BOO:
    "Boötes",

  CAE:
    "Caelum",

  CAM:
    "Camelopardalis",

  CNC:
    "Cancer",

  CVN:
    "Canes Venatici",

  CMA:
    "Canis Major",

  CMI:
    "Canis Minor",

  CAP:
    "Capricornus",

  CAR:
    "Carina",

  CAS:
    "Cassiopeia",

  CEN:
    "Centaurus",

  CEP:
    "Cepheus",

  CET:
    "Cetus",

  CHA:
    "Chamaeleon",

  CIR:
    "Circinus",

  COL:
    "Columba",

  COM:
    "Coma Berenices",

  CRA:
    "Corona Australis",

  CRB:
    "Corona Borealis",

  CRV:
    "Corvus",

  CRT:
    "Crater",

  CRU:
    "Crux",

  CYG:
    "Cygnus",

  DEL:
    "Delphinus",

  DOR:
    "Dorado",

  DRA:
    "Draco",

  EQU:
    "Equuleus",

  ERI:
    "Eridanus",

  FOR:
    "Fornax",

  GEM:
    "Gemini",

  GRU:
    "Grus",

  HER:
    "Hercules",

  HOR:
    "Horologium",

  HYA:
    "Hydra",

  HYI:
    "Hydrus",

  IND:
    "Indus",

  LAC:
    "Lacerta",

  LEO:
    "Leo",

  LMI:
    "Leo Minor",

  LEP:
    "Lepus",

  LIB:
    "Libra",

  LUP:
    "Lupus",

  LYN:
    "Lynx",

  LYR:
    "Lyra",

  MEN:
    "Mensa",

  MIC:
    "Microscopium",

  MON:
    "Monoceros",

  MUS:
    "Musca",

  NOR:
    "Norma",

  OCT:
    "Octans",

  OPH:
    "Ophiuchus",

  ORI:
    "Orion",

  PAV:
    "Pavo",

  PEG:
    "Pegasus",

  PER:
    "Perseus",

  PHE:
    "Phoenix",

  PIC:
    "Pictor",

  PSC:
    "Pisces",

  PSA:
    "Piscis Austrinus",

  PUP:
    "Puppis",

  PYX:
    "Pyxis",

  RET:
    "Reticulum",

  SGE:
    "Sagitta",

  SGR:
    "Sagittarius",

  SCO:
    "Scorpius",

  SCL:
    "Sculptor",

  SCT:
    "Scutum",

  SER:
    "Serpens",

  SEX:
    "Sextans",

  TAU:
    "Taurus",

  TEL:
    "Telescopium",

  TRI:
    "Triangulum",

  TRA:
    "Triangulum Australe",

  TUC:
    "Tucana",

  UMA:
    "Ursa Major",

  UMI:
    "Ursa Minor",

  VEL:
    "Vela",

  VIR:
    "Virgo",

  VOL:
    "Volans",

  VUL:
    "Vulpecula"
};

/* -------------------------------------------------------------------------- */
/* Standard Abbreviations                                                     */
/* -------------------------------------------------------------------------- */

export const CONSTELLATION_ABBREVIATIONS:
  readonly string[] =
    Object.keys(
      CONSTELLATION_NAMES
    );

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createConstellation(
  input:
    Constellation
):
  Constellation {
  validateConstellation(
    input
  );

  return {
    ...input,

    rightAscension:
      normalizeRightAscension(
        input.rightAscension
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function getConstellationName(
  abbreviation:
    string
):
  string |
  null {
  const normalized =
    normalizeAbbreviation(
      abbreviation
    );

  return (
    CONSTELLATION_NAMES[
      normalized
    ] ??
    null
  );
}

export function findConstellationByAbbreviation(
  constellations:
    readonly Constellation[],
  abbreviation:
    string
):
  Constellation |
  null {
  const normalized =
    normalizeAbbreviation(
      abbreviation
    );

  return (
    constellations.find(
      (
        constellation
      ) =>
        constellation
          .abbreviation
          .toUpperCase() ===
        normalized
    ) ??
    null
  );
}

export function findConstellationByName(
  constellations:
    readonly Constellation[],
  name:
    string
):
  Constellation |
  null {
  const normalized =
    normalizeText(
      name
    );

  return (
    constellations.find(
      (
        constellation
      ) =>
        normalizeText(
          constellation.name
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchConstellations(
  constellations:
    readonly Constellation[],
  options:
    ConstellationSearchOptions =
      {}
):
  Constellation[] {
  let results =
    [...constellations];

  if (
    options.name !==
      undefined
  ) {
    const query =
      normalizeText(
        options.name
      );

    results =
      results.filter(
        (
          constellation
        ) =>
          normalizeText(
            constellation.name
          ).includes(
            query
          )
      );
  }

  if (
    options.abbreviation !==
      undefined
  ) {
    const query =
      normalizeAbbreviation(
        options.abbreviation
      );

    results =
      results.filter(
        (
          constellation
        ) =>
          constellation
            .abbreviation
            .toUpperCase()
            .includes(
              query
            )
      );
  }

  if (
    options.hemisphere !==
      undefined
  ) {
    results =
      results.filter(
        (
          constellation
        ) =>
          constellation.hemisphere ===
          options.hemisphere
      );
  }

  if (
    options.limit !==
      undefined
  ) {
    results =
      results.slice(
        0,
        Math.max(
          0,
          Math.floor(
            options.limit
          )
        )
      );
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Coordinate Matching                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Finds the nearest constellation center.
 *
 * This is a center-based approximation. Exact IAU boundary determination
 * should use a supplied ConstellationBoundary dataset.
 */
export function findNearestConstellation(
  constellations:
    readonly Constellation[],
  rightAscension:
    number,
  declination:
    number
):
  ConstellationMatch |
  null {
  if (
    constellations.length ===
    0
  ) {
    return null;
  }

  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    Constellation |
    null =
    null;

  let nearestDistance =
    Infinity;

  for (
    constellation of
      constellations
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        constellation
          .rightAscension,
        constellation
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        constellation;
    }
  }

  if (
    nearest ===
    null
  ) {
    return null;
  }

  return {
    constellation:
      nearest,

    angularDistanceDegrees:
      nearestDistance
  };
}

/* -------------------------------------------------------------------------- */
/* Boundary Queries                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Tests whether a coordinate is inside a supplied constellation boundary.
 *
 * The boundary is treated as a spherical polygon in RA/Dec space.
 * For small constellation-boundary segments this planar projection is
 * sufficient as a lightweight query mechanism; authoritative boundary
 * datasets should still be supplied by the data layer.
 */
export function isInsideConstellationBoundary(
  rightAscension:
    number,
  declination:
    number,
  boundary:
    ConstellationBoundary
):
  boolean {
  validateCoordinates(
    rightAscension,
    declination
  );

  if (
    boundary.points.length <
    3
  ) {
    return false;
  }

  const points =
    boundary.points.map(
      (
        point
      ) => ({
        x:
          normalizeRightAscension(
            point.rightAscension
          ),
        y:
          point.declination
      })
    );

  const targetX =
    normalizeRightAscension(
      rightAscension
    );

  /*
   * Handle RA wrap-around by testing equivalent coordinate copies.
   */
  return (
    pointInPolygon(
      targetX,
      declination,
      points
    ) ||
    pointInPolygon(
      targetX +
        360,
      declination,
      points.map(
        (
          point
        ) => ({
          x:
            point.x +
            360,
          y:
            point.y
        })
      )
    ) ||
    pointInPolygon(
      targetX -
        360,
      declination,
      points.map(
        (
          point
        ) => ({
          x:
            point.x -
            360,
          y:
            point.y
        })
      )
    )
  );
}

/**
 * Returns the constellation whose supplied boundary contains the
 * requested coordinate.
 */
export function findConstellationByBoundary(
  rightAscension:
    number,
  declination:
    number,
  boundaries:
    readonly ConstellationBoundary[],
  constellations:
    readonly Constellation[]
):
  Constellation |
  null {
  for (
    const boundary of
      boundaries
  ) {
    if (
      isInsideConstellationBoundary(
        rightAscension,
        declination,
        boundary
      )
    ) {
      return (
        findConstellationById(
          constellations,
          boundary.constellationId
        )
      );
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Lookup By ID                                                               */
/* -------------------------------------------------------------------------- */

export function findConstellationById(
  constellations:
    readonly Constellation[],
  id:
    string
):
  Constellation |
  null {
  const normalized =
    normalizeText(
      id
    );

  return (
    constellations.find(
      (
        constellation
      ) =>
        normalizeText(
          constellation.id
        ) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Hemisphere                                                                 */
/* -------------------------------------------------------------------------- */

export function determineHemisphere(
  declination:
    number
):
  "northern" |
  "southern" |
  "equatorial" {
  if (
    declination >
      23.5
  ) {
    return "northern";
  }

  if (
    declination <
      -23.5
  ) {
    return "southern";
  }

  return "equatorial";
}

/* -------------------------------------------------------------------------- */
/* Boundary Factory                                                           */
/* -------------------------------------------------------------------------- */

export function createConstellationBoundary(
  constellationId:
    string,
  points:
    readonly ConstellationBoundaryPoint[]
):
  ConstellationBoundary {
  if (
    !constellationId ||
    constellationId.trim()
      .length ===
      0
  ) {
    throw new TypeError(
      "Constellation boundary requires a constellation id."
    );
  }

  if (
    points.length <
    3
  ) {
    throw new RangeError(
      "A constellation boundary requires at least three points."
    );
  }

  const normalizedPoints =
    points.map(
      (
        point
      ) => {
        validateCoordinates(
          point.rightAscension,
          point.declination
        );

        return {
          rightAscension:
            normalizeRightAscension(
              point.rightAscension
            ),

          declination:
            point.declination
        };
      }
    );

  return {
    constellationId:
      constellationId
        .trim(),

    points:
      normalizedPoints
  };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateConstellation(
  constellation:
    Constellation
):
  void {
  if (
    !constellation.id ||
    typeof constellation.id !==
      "string"
  ) {
    throw new TypeError(
      "Constellation id must be a non-empty string."
    );
  }

  if (
    !constellation.name ||
    typeof constellation.name !==
      "string"
  ) {
    throw new TypeError(
      "Constellation name must be a non-empty string."
    );
  }

  if (
    !constellation.abbreviation ||
    typeof constellation.abbreviation !==
      "string"
  ) {
    throw new TypeError(
      "Constellation abbreviation must be a non-empty string."
    );
  }

  validateCoordinates(
    constellation.rightAscension,
    constellation.declination
  );
}

function validateCoordinates(
  rightAscension:
    number,
  declination:
    number
):
  void {
  if (
    !Number.isFinite(
      rightAscension
    )
  ) {
    throw new TypeError(
      "Right ascension must be finite."
    );
  }

  if (
    !Number.isFinite(
      declination
    ) ||
    declination <
      -90 ||
    declination >
      90
  ) {
    throw new RangeError(
      "Declination must be between -90 and 90 degrees."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

function angularDistance(
  rightAscensionA:
    number,
  declinationA:
    number,
  rightAscensionB:
    number,
  declinationB:
    number
):
  number {
  const raA =
    normalizeRightAscension(
      rightAscensionA
    ) *
    Math.PI /
    180;

  const raB =
    normalizeRightAscension(
      rightAscensionB
    ) *
    Math.PI /
    180;

  const decA =
    declinationA *
    Math.PI /
    180;

  const decB =
    declinationB *
    Math.PI /
    180;

  const cosine =
    Math.sin(decA) *
      Math.sin(decB) +
    Math.cos(decA) *
      Math.cos(decB) *
      Math.cos(
        raA -
        raB
      );

  return (
    Math.acos(
      Math.min(
        1,
        Math.max(
          -1,
          cosine
        )
      )
    ) *
    180 /
    Math.PI
  );
}

function pointInPolygon(
  x:
    number,
  y:
    number,
  polygon:
    readonly {
      x:
        number;

      y:
        number;
    }[]
):
  boolean {
  let inside =
    false;

  for (
    let i = 0,
      j =
        polygon.length -
        1;
    i <
    polygon.length;
    j =
      i++
  ) {
    const xi =
      polygon[i].x;

    const yi =
      polygon[i].y;

    const xj =
      polygon[j].x;

    const yj =
      polygon[j].y;

    const intersects =
      (
        yi >
          y
      ) !==
        (
          yj >
            y
        ) &&
      x <
        (
          xj -
          xi
        ) *
          (
            y -
            yi
          ) /
          (
            yj -
            yi
          ) +
        xi;

    if (
      intersects
    ) {
      inside =
        !inside;
    }
  }

  return inside;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function normalizeAbbreviation(
  value:
    string
):
  string {
  return value
    .trim()
    .toUpperCase();
}

function normalizeText(
  value:
    string
):
  string {
  return value
    .trim()
    .toLocaleLowerCase();
}

function normalizeRightAscension(
  degrees:
    number
):
  number {
  return (
    (
      degrees %
      360
    ) +
    360
  ) %
    360;
}

export default {
  createConstellation,
  findConstellationById,
  findConstellationByName,
  findConstellationByAbbreviation,
  findConstellationByBoundary,
  findNearestConstellation,
  getConstellationName,
  searchConstellations,
  isInsideConstellationBoundary,
  createConstellationBoundary,
  determineHemisphere
};
