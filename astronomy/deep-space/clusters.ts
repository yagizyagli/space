/**
 * Space
 * Astronomy — Deep Space / Clusters
 *
 * Star-cluster and galaxy-cluster data models and utilities.
 */

export type ClusterType =
  | "open"
  | "globular"
  | "galaxy"
  | "supercluster"
  | "candidate"
  | "unknown";

export interface ClusterCoordinates {
  rightAscension: number;
  declination: number;
}

export interface Cluster {
  id: string;
  name: string;
  type: ClusterType;

  coordinates: ClusterCoordinates;

  distanceLightYears?: number;
  distanceParsecs?: number;

  redshift?: number;

  apparentMagnitude?: number;
  absoluteMagnitude?: number;

  angularDiameterArcminutes?: number;

  memberCount?: number;

  ageYears?: number;

  massSolar?: number;

  constellationId?: string;

  catalogIds?: Readonly<Record<string, string>>;

  description?: string;
}

export interface ClusterSearchOptions {
  name?: string;
  type?: ClusterType;
  constellationId?: string;

  minimumDistanceLightYears?: number;
  maximumDistanceLightYears?: number;

  minimumMemberCount?: number;
  maximumMemberCount?: number;

  minimumMassSolar?: number;
  maximumMassSolar?: number;

  maximumMagnitude?: number;

  limit?: number;
}

export interface ClusterDistance {
  parsecs: number;
  lightYears: number;
  megaparsecs: number;
}

export interface ClusterAngularSize {
  diameterArcminutes: number;
  diameterDegrees: number;
  diameterArcseconds: number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const PARSEC_LIGHT_YEARS =
  3.261563777;

export const MEGAPARSEC_PARSEC =
  1_000_000;

export const SPEED_OF_LIGHT_KM_PER_SECOND =
  299_792.458;

export const HUBBLE_CONSTANT_KM_PER_SECOND_PER_MPC =
  70;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createCluster(
  input: Cluster
): Cluster {
  validateCluster(input);

  return {
    ...input,

    coordinates: {
      rightAscension:
        normalizeRightAscension(
          input.coordinates.rightAscension
        ),

      declination:
        input.coordinates.declination
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function findClusterById(
  clusters: readonly Cluster[],
  id: string
): Cluster | null {
  const normalized =
    normalizeText(id);

  return (
    clusters.find(
      (cluster) =>
        normalizeText(cluster.id) ===
        normalized
    ) ??
    null
  );
}

export function findClusterByName(
  clusters: readonly Cluster[],
  name: string
): Cluster | null {
  const normalized =
    normalizeText(name);

  return (
    clusters.find(
      (cluster) =>
        normalizeText(cluster.name) ===
        normalized
    ) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchClusters(
  clusters: readonly Cluster[],
  options: ClusterSearchOptions = {}
): Cluster[] {
  let results = [...clusters];

  if (
    options.name !==
    undefined
  ) {
    const query =
      normalizeText(options.name);

    results =
      results.filter(
        (cluster) =>
          normalizeText(
            cluster.name
          ).includes(query)
      );
  }

  if (
    options.type !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.type ===
          options.type
      );
  }

  if (
    options.constellationId !==
    undefined
  ) {
    const constellation =
      normalizeText(
        options.constellationId
      );

    results =
      results.filter(
        (cluster) =>
          cluster.constellationId !==
            undefined &&
          normalizeText(
            cluster.constellationId
          ) === constellation
      );
  }

  if (
    options.minimumDistanceLightYears !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) => {
          const distance =
            getClusterDistanceLightYears(
              cluster
            );

          return (
            distance !== null &&
            distance >=
              options.minimumDistanceLightYears!
          );
        }
      );
  }

  if (
    options.maximumDistanceLightYears !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) => {
          const distance =
            getClusterDistanceLightYears(
              cluster
            );

          return (
            distance !== null &&
            distance <=
              options.maximumDistanceLightYears!
          );
        }
      );
  }

  if (
    options.minimumMemberCount !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.memberCount !==
            undefined &&
          cluster.memberCount >=
            options.minimumMemberCount!
      );
  }

  if (
    options.maximumMemberCount !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.memberCount !==
            undefined &&
          cluster.memberCount <=
            options.maximumMemberCount!
      );
  }

  if (
    options.minimumMassSolar !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.massSolar !==
            undefined &&
          cluster.massSolar >=
            options.minimumMassSolar!
      );
  }

  if (
    options.maximumMassSolar !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.massSolar !==
            undefined &&
          cluster.massSolar <=
            options.maximumMassSolar!
      );
  }

  if (
    options.maximumMagnitude !==
    undefined
  ) {
    results =
      results.filter(
        (cluster) =>
          cluster.apparentMagnitude !==
            undefined &&
          cluster.apparentMagnitude <=
            options.maximumMagnitude!
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
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

export function parsecsToLightYears(
  parsecs: number
): number {
  validatePositiveOrZero(
    parsecs,
    "Parsecs"
  );

  return (
    parsecs *
    PARSEC_LIGHT_YEARS
  );
}

export function lightYearsToParsecs(
  lightYears: number
): number {
  validatePositiveOrZero(
    lightYears,
    "Light-years"
  );

  return (
    lightYears /
    PARSEC_LIGHT_YEARS
  );
}

export function megaparsecsToParsecs(
  megaparsecs: number
): number {
  validatePositiveOrZero(
    megaparsecs,
    "Megaparsecs"
  );

  return (
    megaparsecs *
    MEGAPARSEC_PARSEC
  );
}

export function parsecsToMegaparsecs(
  parsecs: number
): number {
  validatePositiveOrZero(
    parsecs,
    "Parsecs"
  );

  return (
    parsecs /
    MEGAPARSEC_PARSEC
  );
}

export function getClusterDistanceLightYears(
  cluster: Cluster
): number | null {
  if (
    cluster.distanceLightYears !==
    undefined
  ) {
    return cluster.distanceLightYears;
  }

  if (
    cluster.distanceParsecs !==
    undefined
  ) {
    return parsecsToLightYears(
      cluster.distanceParsecs
    );
  }

  return null;
}

export function getClusterDistanceParsecs(
  cluster: Cluster
): number | null {
  if (
    cluster.distanceParsecs !==
    undefined
  ) {
    return cluster.distanceParsecs;
  }

  if (
    cluster.distanceLightYears !==
    undefined
  ) {
    return lightYearsToParsecs(
      cluster.distanceLightYears
    );
  }

  return null;
}

export function getClusterDistance(
  cluster: Cluster
): ClusterDistance | null {
  const parsecs =
    getClusterDistanceParsecs(
      cluster
    );

  if (
    parsecs === null
  ) {
    return null;
  }

  return {
    parsecs,

    lightYears:
      parsecsToLightYears(
        parsecs
      ),

    megaparsecs:
      parsecsToMegaparsecs(
        parsecs
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Redshift                                                                    */
/* -------------------------------------------------------------------------- */

export function redshiftToApproximateDistanceMegaparsecs(
  redshift: number,
  hubbleConstant:
    number =
      HUBBLE_CONSTANT_KM_PER_SECOND_PER_MPC
): number {
  validateRedshift(
    redshift
  );

  if (
    !Number.isFinite(
      hubbleConstant
    ) ||
    hubbleConstant <=
    0
  ) {
    throw new RangeError(
      "Hubble constant must be greater than zero."
    );
  }

  return (
    redshift *
    SPEED_OF_LIGHT_KM_PER_SECOND /
    hubbleConstant
  );
}

export function redshiftToApproximateVelocityKmPerSecond(
  redshift: number
): number {
  validateRedshift(
    redshift
  );

  return (
    redshift *
    SPEED_OF_LIGHT_KM_PER_SECOND
  );
}

export function redshiftToRelativisticVelocityKmPerSecond(
  redshift: number
): number {
  validateRedshift(
    redshift
  );

  const onePlusZ =
    1 +
    redshift;

  const beta =
    (
      onePlusZ ** 2 -
      1
    ) /
    (
      onePlusZ ** 2 +
      1
    );

  return (
    beta *
    SPEED_OF_LIGHT_KM_PER_SECOND
  );
}

/* -------------------------------------------------------------------------- */
/* Angular Size                                                               */
/* -------------------------------------------------------------------------- */

export function createClusterAngularSize(
  diameterArcminutes: number
): ClusterAngularSize {
  if (
    !Number.isFinite(
      diameterArcminutes
    ) ||
    diameterArcminutes <
    0
  ) {
    throw new RangeError(
      "Angular diameter must be zero or greater."
    );
  }

  return {
    diameterArcminutes,

    diameterDegrees:
      diameterArcminutes /
      60,

    diameterArcseconds:
      diameterArcminutes *
      60
  };
}

export function angularDiameterToDegrees(
  arcminutes: number
): number {
  if (
    !Number.isFinite(
      arcminutes
    ) ||
    arcminutes <
    0
  ) {
    throw new RangeError(
      "Angular diameter must be zero or greater."
    );
  }

  return (
    arcminutes /
    60
  );
}

/* -------------------------------------------------------------------------- */
/* Coordinates                                                                */
/* -------------------------------------------------------------------------- */

export function findNearestCluster(
  clusters: readonly Cluster[],
  rightAscension: number,
  declination: number
): Cluster | null {
  validateCoordinates(
    rightAscension,
    declination
  );

  let nearest:
    Cluster | null =
    null;

  let nearestDistance =
    Infinity;

  for (
    const cluster of
    clusters
  ) {
    const distance =
      angularDistance(
        rightAscension,
        declination,
        cluster.coordinates
          .rightAscension,
        cluster.coordinates
          .declination
      );

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest =
        cluster;
    }
  }

  return nearest;
}

export function findClustersWithinAngularRadius(
  clusters: readonly Cluster[],
  rightAscension: number,
  declination: number,
  radiusDegrees: number
): Cluster[] {
  validateCoordinates(
    rightAscension,
    declination
  );

  if (
    !Number.isFinite(
      radiusDegrees
    ) ||
    radiusDegrees <
    0
  ) {
    throw new RangeError(
      "Radius must be zero or greater."
    );
  }

  return clusters.filter(
    (cluster) =>
      angularDistance(
        rightAscension,
        declination,
        cluster.coordinates
          .rightAscension,
        cluster.coordinates
          .declination
      ) <=
      radiusDegrees
  );
}

/* -------------------------------------------------------------------------- */
/* Magnitude                                                                  */
/* -------------------------------------------------------------------------- */

export function absoluteMagnitudeFromLuminosityRatio(
  luminositySolar: number
): number {
  if (
    !Number.isFinite(
      luminositySolar
    ) ||
    luminositySolar <=
    0
  ) {
    throw new RangeError(
      "Luminosity must be greater than zero."
    );
  }

  return (
    4.83 -
    2.5 *
      Math.log10(
        luminositySolar
      )
  );
}

export function luminosityRatioFromAbsoluteMagnitude(
  absoluteMagnitude: number
): number {
  validateFinite(
    absoluteMagnitude,
    "Absolute magnitude"
  );

  return (
    10 **
    (
      (
        4.83 -
        absoluteMagnitude
      ) /
      2.5
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateCluster(
  cluster: Cluster
): void {
  if (
    !cluster.id ||
    typeof cluster.id !==
    "string"
  ) {
    throw new TypeError(
      "Cluster id must be a non-empty string."
    );
  }

  if (
    !cluster.name ||
    typeof cluster.name !==
    "string"
  ) {
    throw new TypeError(
      "Cluster name must be a non-empty string."
    );
  }

  validateCoordinates(
    cluster.coordinates
      .rightAscension,
    cluster.coordinates
      .declination
  );

  if (
    cluster.distanceLightYears !==
    undefined
  ) {
    validatePositiveOrZero(
      cluster.distanceLightYears,
      "Distance"
    );
  }

  if (
    cluster.distanceParsecs !==
    undefined
  ) {
    validatePositiveOrZero(
      cluster.distanceParsecs,
      "Distance"
    );
  }

  if (
    cluster.redshift !==
    undefined
  ) {
    validateRedshift(
      cluster.redshift
    );
  }

  if (
    cluster.memberCount !==
    undefined
  ) {
    if (
      !Number.isInteger(
        cluster.memberCount
      ) ||
      cluster.memberCount <
      0
    ) {
      throw new RangeError(
        "Member count must be a non-negative integer."
      );
    }
  }

  if (
    cluster.massSolar !==
    undefined
  ) {
    validatePositiveOrZero(
      cluster.massSolar,
      "Mass"
    );
  }

  if (
    cluster.ageYears !==
    undefined
  ) {
    validatePositiveOrZero(
      cluster.ageYears,
      "Age"
    );
  }
}

function validateCoordinates(
  rightAscension: number,
  declination: number
): void {
  validateFinite(
    rightAscension,
    "Right ascension"
  );

  validateFinite(
    declination,
    "Declination"
  );

  if (
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

function validateRedshift(
  redshift: number
): void {
  if (
    !Number.isFinite(
      redshift
    ) ||
    redshift <
    0
  ) {
    throw new RangeError(
      "Redshift must be zero or greater."
    );
  }
}

function validateFinite(
  value: number,
  label: string
): void {
  if (
    !Number.isFinite(
      value
    )
  ) {
    throw new TypeError(
      `${label} must be finite.`
    );
  }
}

function validatePositiveOrZero(
  value: number,
  label: string
): void {
  if (
    !Number.isFinite(
      value
    ) ||
    value <
    0
  ) {
    throw new RangeError(
      `${label} must be zero or greater.`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

function angularDistance(
  rightAscensionA: number,
  declinationA: number,
  rightAscensionB: number,
  declinationB: number
): number {
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

function normalizeRightAscension(
  degrees: number
): number {
  return (
    (
      degrees %
      360
    ) +
    360
  ) %
    360;
}

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase();
}

/* -------------------------------------------------------------------------- */
/* Default Export                                                             */
/* -------------------------------------------------------------------------- */

export default {
  createCluster,

  findClusterById,

  findClusterByName,

  searchClusters,

  parsecsToLightYears,

  lightYearsToParsecs,

  megaparsecsToParsecs,

  parsecsToMegaparsecs,

  getClusterDistanceLightYears,

  getClusterDistanceParsecs,

  getClusterDistance,

  redshiftToApproximateDistanceMegaparsecs,

  redshiftToApproximateVelocityKmPerSecond,

  redshiftToRelativisticVelocityKmPerSecond,

  createClusterAngularSize,

  angularDiameterToDegrees,

  findNearestCluster,

  findClustersWithinAngularRadius,

  absoluteMagnitudeFromLuminosityRatio,

  luminosityRatioFromAbsoluteMagnitude
};
