/**
 * Space
 * Constellation Astronomy
 *
 * Constellation definitions and sky-map utilities.
 *
 * Provides:
 * - Constellation metadata
 * - Abbreviation / IAU-style identifiers
 * - Anchor stars
 * - Line segments
 * - Label positions
 * - Approximate sky regions
 * - Visibility helpers
 * - Star membership
 * - Catalog integration
 * - Search / lookup utilities
 *
 * Coordinate conventions:
 * - Right ascension / declination are radians.
 * - Right ascension is normalized to [0, 2π).
 * - Declination is [-π/2, π/2].
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TWO_PI =
  Math.PI * 2;

const DEG_TO_RAD =
  Math.PI / 180;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ConstellationId =
  | "and"
  | "ant"
  | "aps"
  | "aqr"
  | "aql"
  | "ara"
  | "ari"
  | "aur"
  | "boo"
  | "cae"
  | "cam"
  | "cnc"
  | "cvn"
  | "cma"
  | "cmi"
  | "cap"
  | "car"
  | "cas"
  | "cen"
  | "cep"
  | "cet"
  | "cha"
  | "cir"
  | "col"
  | "com"
  | "cra"
  | "crb"
  | "crv"
  | "crt"
  | "cru"
  | "cyg"
  | "del"
  | "dor"
  | "dra"
  | "equ"
  | "eri"
  | "for"
  | "gem"
  | "gru"
  | "her"
  | "hor"
  | "hya"
  | "hyi"
  | "ind"
  | "lac"
  | "leo"
  | "lmi"
  | "lep"
  | "lib"
  | "lup"
  | "lyn"
  | "lyr"
  | "men"
  | "mic"
  | "mon"
  | "mus"
  | "nor"
  | "oct"
  | "oph"
  | "ori"
  | "pav"
  | "peg"
  | "per"
  | "phe"
  | "pic"
  | "psc"
  | "psa"
  | "pup"
  | "pyx"
  | "ret"
  | "sge"
  | "sgr"
  | "sco"
  | "scl"
  | "sct"
  | "ser"
  | "sex"
  | "tau"
  | "tel"
  | "tri"
  | "tra"
  | "tuc"
  | "uma"
  | "umi"
  | "vel"
  | "vir"
  | "vol"
  | "vul";

export interface SkyCoordinate {
  rightAscension: number;
  declination: number;
}

export interface ConstellationLine {
  from: string;
  to: string;
}

export interface ConstellationRegion {
  rightAscensionMin: number;
  rightAscensionMax: number;

  declinationMin: number;
  declinationMax: number;
}

export interface Constellation {
  id: ConstellationId;

  abbreviation: string;

  name: string;

  genitive: string;

  hemisphere:
    | "northern"
    | "southern"
    | "equatorial";

  areaSquareDegrees: number;

  label: SkyCoordinate;

  stars: readonly string[];

  lines: readonly ConstellationLine[];

  region: ConstellationRegion;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
/* -------------------------------------------------------------------------- */

function degrees(
  value: number
): number {
  return value *
    DEG_TO_RAD;
}

function hours(
  value: number
): number {
  return value *
    Math.PI /
    12;
}

function normalizeRA(
  value: number
): number {
  const result =
    value % TWO_PI;

  return result < 0
    ? result + TWO_PI
    : result;
}

function normalizeDec(
  value: number
): number {
  return Math.max(
    -Math.PI / 2,
    Math.min(
      Math.PI / 2,
      value
    )
  );
}

function coordinate(
  raHours: number,
  decDegrees: number
): SkyCoordinate {
  return {
    rightAscension:
      normalizeRA(
        hours(
          raHours
        )
      ),

    declination:
      normalizeDec(
        degrees(
          decDegrees
        )
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Line helper                                                                 */
/* -------------------------------------------------------------------------- */

function line(
  from: string,
  to: string
): ConstellationLine {
  return {
    from,
    to
  };
}

/* -------------------------------------------------------------------------- */
/* Constellation definitions                                                   */
/* -------------------------------------------------------------------------- */

export const CONSTELLATIONS:
  readonly Constellation[] = [

  {
    id: "and",
    abbreviation: "And",
    name: "Andromeda",
    genitive: "Andromedae",
    hemisphere: "northern",
    areaSquareDegrees: 722.278,
    label: coordinate(0.75, 38),
    stars: [
      "alpheratz",
      "mirach",
      "almach",
      "delta-and"
    ],
    lines: [
      line("alpheratz", "mirach"),
      line("mirach", "almach"),
      line("mirach", "delta-and")
    ],
    region: {
      rightAscensionMin: hours(22.8),
      rightAscensionMax: hours(2.5),
      declinationMin: degrees(21),
      declinationMax: degrees(53)
    }
  },

  {
    id: "ant",
    abbreviation: "Ant",
    name: "Antlia",
    genitive: "Antliae",
    hemisphere: "southern",
    areaSquareDegrees: 238.901,
    label: coordinate(10.4, -32),
    stars: [
      "alpha-ant",
      "epsilon-ant",
      "iota-ant"
    ],
    lines: [
      line("alpha-ant", "epsilon-ant"),
      line("epsilon-ant", "iota-ant")
    ],
    region: {
      rightAscensionMin: hours(9.2),
      rightAscensionMax: hours(11.0),
      declinationMin: degrees(-40),
      declinationMax: degrees(-24)
    }
  },

  {
    id: "aqr",
    abbreviation: "Aqr",
    name: "Aquarius",
    genitive: "Aquarii",
    hemisphere: "equatorial",
    areaSquareDegrees: 979.854,
    label: coordinate(22.3, -12),
    stars: [
      "sadalsuud",
      "sadalmelik",
      "skati",
      "sadachbia",
      "albali"
    ],
    lines: [
      line("sadalsuud", "sadalmelik"),
      line("sadalsuud", "skati"),
      line("skati", "sadachbia"),
      line("sadachbia", "albali")
    ],
    region: {
      rightAscensionMin: hours(20.7),
      rightAscensionMax: hours(23.9),
      declinationMin: degrees(-25),
      declinationMax: degrees(3)
    }
  },

  {
    id: "aql",
    abbreviation: "Aql",
    name: "Aquila",
    genitive: "Aquilae",
    hemisphere: "equatorial",
    areaSquareDegrees: 652.473,
    label: coordinate(19.65, 3),
    stars: [
      "altair",
      "tarazed",
      "alshain",
      "delta-aql",
      "zeta-aql"
    ],
    lines: [
      line("altair", "tarazed"),
      line("altair", "alshain"),
      line("tarazed", "delta-aql"),
      line("alshain", "zeta-aql")
    ],
    region: {
      rightAscensionMin: hours(18.5),
      rightAscensionMax: hours(20.5),
      declinationMin: degrees(-12),
      declinationMax: degrees(18)
    }
  },

  {
    id: "ari",
    abbreviation: "Ari",
    name: "Aries",
    genitive: "Arietis",
    hemisphere: "northern",
    areaSquareDegrees: 441.395,
    label: coordinate(2.45, 21),
    stars: [
      "hamal",
      "sheratan",
      "mesarthim"
    ],
    lines: [
      line("hamal", "sheratan"),
      line("sheratan", "mesarthim")
    ],
    region: {
      rightAscensionMin: hours(1.5),
      rightAscensionMax: hours(3.3),
      declinationMin: degrees(10),
      declinationMax: degrees(31)
    }
  },

  {
    id: "aur",
    abbreviation: "Aur",
    name: "Auriga",
    genitive: "Aurigae",
    hemisphere: "northern",
    areaSquareDegrees: 657.438,
    label: coordinate(5.5, 40),
    stars: [
      "capella",
      "menkalinan",
      "maaz",
      "epsilon-aur",
      "zeta-aur"
    ],
    lines: [
      line("capella", "menkalinan"),
      line("capella", "maaz"),
      line("menkalinan", "epsilon-aur"),
      line("maaz", "zeta-aur")
    ],
    region: {
      rightAscensionMin: hours(4.6),
      rightAscensionMax: hours(6.3),
      declinationMin: degrees(28),
      declinationMax: degrees(56)
    }
  },

  {
    id: "boo",
    abbreviation: "Boo",
    name: "Boötes",
    genitive: "Boötis",
    hemisphere: "northern",
    areaSquareDegrees: 906.831,
    label: coordinate(14.7, 31),
    stars: [
      "arcturus",
      "nekker",
      "muphrid",
      "izar",
      "rho-boo"
    ],
    lines: [
      line("arcturus", "muphrid"),
      line("arcturus", "nekker"),
      line("nekker", "izar"),
      line("izar", "rho-boo")
    ],
    region: {
      rightAscensionMin: hours(13.3),
      rightAscensionMax: hours(15.5),
      declinationMin: degrees(7),
      declinationMax: degrees(55)
    }
  },

  {
    id: "cma",
    abbreviation: "CMa",
    name: "Canis Major",
    genitive: "Canis Majoris",
    hemisphere: "southern",
    areaSquareDegrees: 380.118,
    label: coordinate(6.75, -23),
    stars: [
      "sirius",
      "mirzam",
      "wezen",
      "adhaara",
      "aludra"
    ],
    lines: [
      line("sirius", "mirzam"),
      line("sirius", "wezen"),
      line("wezen", "adhaara"),
      line("wezen", "aludra")
    ],
    region: {
      rightAscensionMin: hours(6.0),
      rightAscensionMax: hours(7.4),
      declinationMin: degrees(-34),
      declinationMax: degrees(-11)
    }
  },

  {
    id: "cap",
    abbreviation: "Cap",
    name: "Capricornus",
    genitive: "Capricorni",
    hemisphere: "equatorial",
    areaSquareDegrees: 413.947,
    label: coordinate(21.0, -20),
    stars: [
      "deneb-algedi",
      "dabih",
      "nashira",
      "algedi"
    ],
    lines: [
      line("algedi", "dabih"),
      line("dabih", "nashira"),
      line("nashira", "deneb-algedi")
    ],
    region: {
      rightAscensionMin: hours(20.5),
      rightAscensionMax: hours(22.1),
      declinationMin: degrees(-28),
      declinationMax: degrees(-8)
    }
  },

  {
    id: "cas",
    abbreviation: "Cas",
    name: "Cassiopeia",
    genitive: "Cassiopeiae",
    hemisphere: "northern",
    areaSquareDegrees: 598.407,
    label: coordinate(1.0, 60),
    stars: [
      "schedar",
      "caph",
      "gamma-cas",
      "ruchbah",
      "segin"
    ],
    lines: [
      line("caph", "gamma-cas"),
      line("gamma-cas", "schedar"),
      line("schedar", "ruchbah"),
      line("ruchbah", "segin")
    ],
    region: {
      rightAscensionMin: hours(0.1),
      rightAscensionMax: hours(2.2),
      declinationMin: degrees(46),
      declinationMax: degrees(68)
    }
  },

  {
    id: "cen",
    abbreviation: "Cen",
    name: "Centaurus",
    genitive: "Centauri",
    hemisphere: "southern",
    areaSquareDegrees: 1060.422,
    label: coordinate(13.3, -48),
    stars: [
      "rigil-kentaurus",
      "hadar",
      "menkent",
      "muhlifain"
    ],
    lines: [
      line(
        "rigil-kentaurus",
        "hadar"
      ),
      line(
        "rigil-kentaurus",
        "menkent"
      ),
      line(
        "hadar",
        "muhlifain"
      )
    ],
    region: {
      rightAscensionMin: hours(11.0),
      rightAscensionMax: hours(15.2),
      declinationMin: degrees(-65),
      declinationMax: degrees(-30)
    }
  },

  {
    id: "cyg",
    abbreviation: "Cyg",
    name: "Cygnus",
    genitive: "Cygni",
    hemisphere: "northern",
    areaSquareDegrees: 803.983,
    label: coordinate(20.6, 43),
    stars: [
      "deneb",
      "sadr",
      "gienah",
      "delta-cyg",
      "albireo"
    ],
    lines: [
      line("deneb", "sadr"),
      line("sadr", "gienah"),
      line("sadr", "delta-cyg"),
      line("sadr", "albireo")
    ],
    region: {
      rightAscensionMin: hours(19.1),
      rightAscensionMax: hours(22.0),
      declinationMin: degrees(27),
      declinationMax: degrees(61)
    }
  },

  {
    id: "gem",
    abbreviation: "Gem",
    name: "Gemini",
    genitive: "Geminorum",
    hemisphere: "northern",
    areaSquareDegrees: 513.761,
    label: coordinate(7.05, 28),
    stars: [
      "pollux",
      "castor",
      "wasat",
      "mekbuda",
      "tejat"
    ],
    lines: [
      line("castor", "pollux"),
      line("pollux", "wasat"),
      line("wasat", "mekbuda"),
      line("mekbuda", "tejat")
    ],
    region: {
      rightAscensionMin: hours(5.9),
      rightAscensionMax: hours(8.1),
      declinationMin: degrees(10),
      declinationMax: degrees(36)
    }
  },

  {
    id: "her",
    abbreviation: "Her",
    name: "Hercules",
    genitive: "Herculis",
    hemisphere: "northern",
    areaSquareDegrees: 1225.148,
    label: coordinate(17.25, 27),
    stars: [
      "ras-algethi",
      "kornephoros",
      "zeta-her",
      "eta-her",
      "pi-her"
    ],
    lines: [
      line("ras-algethi", "kornephoros"),
      line("kornephoros", "zeta-her"),
      line("zeta-her", "eta-her"),
      line("eta-her", "pi-her")
    ],
    region: {
      rightAscensionMin: hours(15.8),
      rightAscensionMax: hours(18.8),
      declinationMin: degrees(4),
      declinationMax: degrees(51)
    }
  },

  {
    id: "leo",
    abbreviation: "Leo",
    name: "Leo",
    genitive: "Leonis",
    hemisphere: "northern",
    areaSquareDegrees: 946.964,
    label: coordinate(10.7, 14),
    stars: [
      "regulus",
      "denebola",
      "algieba",
      "zosma",
      "chertan"
    ],
    lines: [
      line("regulus", "algieba"),
      line("algieba", "zosma"),
      line("zosma", "denebola"),
      line("regulus", "chertan")
    ],
    region: {
      rightAscensionMin: hours(9.2),
      rightAscensionMax: hours(11.9),
      declinationMin: degrees(-6),
      declinationMax: degrees(34)
    }
  },

  {
    id: "lyr",
    abbreviation: "Lyr",
    name: "Lyra",
    genitive: "Lyrae",
    hemisphere: "northern",
    areaSquareDegrees: 286.476,
    label: coordinate(18.85, 37),
    stars: [
      "vega",
      "sheliak",
      "sulafat",
      "delta-lyr"
    ],
    lines: [
      line("vega", "sheliak"),
      line("vega", "sulafat"),
      line("sheliak", "delta-lyr")
    ],
    region: {
      rightAscensionMin: hours(18.0),
      rightAscensionMax: hours(19.4),
      declinationMin: degrees(25),
      declinationMax: degrees(48)
    }
  },

  {
    id: "ori",
    abbreviation: "Ori",
    name: "Orion",
    genitive: "Orionis",
    hemisphere: "equatorial",
    areaSquareDegrees: 594.12,
    label: coordinate(5.6, 5),
    stars: [
      "betelgeuse",
      "bellatrix",
      "alnilam",
      "alnitak",
      "mintaka",
      "saiph",
      "rigel"
    ],
    lines: [
      line("betelgeuse", "bellatrix"),
      line("betelgeuse", "alnilam"),
      line("bellatrix", "mintaka"),
      line("alnilam", "alnitak"),
      line("alnilam", "mintaka"),
      line("alnitak", "saiph"),
      line("mintaka", "rigel")
    ],
    region: {
      rightAscensionMin: hours(4.7),
      rightAscensionMax: hours(6.3),
      declinationMin: degrees(-11),
      declinationMax: degrees(23)
    }
  },

  {
    id: "peg",
    abbreviation: "Peg",
    name: "Pegasus",
    genitive: "Pegasi",
    hemisphere: "northern",
    areaSquareDegrees: 1120.794,
    label: coordinate(22.7, 20),
    stars: [
      "markab",
      "scheat",
      "algenib",
      "alpheratz"
    ],
    lines: [
      line("markab", "scheat"),
      line("scheat", "alpheratz"),
      line("alpheratz", "algenib"),
      line("algenib", "markab")
    ],
    region: {
      rightAscensionMin: hours(21.0),
      rightAscensionMax: hours(0.2),
      declinationMin: degrees(2),
      declinationMax: degrees(36)
    }
  },

  {
    id: "psc",
    abbreviation: "Psc",
    name: "Pisces",
    genitive: "Piscium",
    hemisphere: "equatorial",
    areaSquareDegrees: 889.417,
    label: coordinate(0.5, 8),
    stars: [
      "alrescha",
      "gamma-psc",
      "eta-psc",
      "omega-psc"
    ],
    lines: [
      line("alrescha", "gamma-psc"),
      line("gamma-psc", "eta-psc"),
      line("eta-psc", "omega-psc")
    ],
    region: {
      rightAscensionMin: hours(22.6),
      rightAscensionMax: hours(2.0),
      declinationMin: degrees(-7),
      declinationMax: degrees(34)
    }
  },

  {
    id: "sco",
    abbreviation: "Sco",
    name: "Scorpius",
    genitive: "Scorpii",
    hemisphere: "southern",
    areaSquareDegrees: 496.783,
    label: coordinate(16.9, -30),
    stars: [
      "antares",
      "graffias",
      "dschubba",
      "shaula",
      "sargas",
      "lesath"
    ],
    lines: [
      line("graffias", "dschubba"),
      line("dschubba", "antares"),
      line("antares", "sargas"),
      line("sargas", "shaula"),
      line("shaula", "lesath")
    ],
    region: {
      rightAscensionMin: hours(15.7),
      rightAscensionMax: hours(17.9),
      declinationMin: degrees(-46),
      declinationMax: degrees(-8)
    }
  },

  {
    id: "sgr",
    abbreviation: "Sgr",
    name: "Sagittarius",
    genitive: "Sagittarii",
    hemisphere: "southern",
    areaSquareDegrees: 867.432,
    label: coordinate(19.1, -25),
    stars: [
      "kaus-australis",
      "kaus-media",
      "kaus-borealis",
      "nunki",
      "ascella",
      "rukbat"
    ],
    lines: [
      line("kaus-australis", "kaus-media"),
      line("kaus-media", "kaus-borealis"),
      line("kaus-australis", "rukbat"),
      line("kaus-media", "nunki"),
      line("nunki", "ascella")
    ],
    region: {
      rightAscensionMin: hours(17.6),
      rightAscensionMax: hours(20.4),
      declinationMin: degrees(-45),
      declinationMax: degrees(-12)
    }
  },

  {
    id: "tau",
    abbreviation: "Tau",
    name: "Taurus",
    genitive: "Tauri",
    hemisphere: "northern",
    areaSquareDegrees: 797.249,
    label: coordinate(4.6, 15),
    stars: [
      "aldebaran",
      "elnath",
      "theta-tau",
      "zeta-tau"
    ],
    lines: [
      line("aldebaran", "theta-tau"),
      line("theta-tau", "elnath"),
      line("aldebaran", "zeta-tau")
    ],
    region: {
      rightAscensionMin: hours(3.3),
      rightAscensionMax: hours(5.9),
      declinationMin: degrees(-2),
      declinationMax: degrees(31)
    }
  },

  {
    id: "uma",
    abbreviation: "UMa",
    name: "Ursa Major",
    genitive: "Ursae Majoris",
    hemisphere: "northern",
    areaSquareDegrees: 1279.66,
    label: coordinate(11.5, 50),
    stars: [
      "dubhe",
      "merak",
      "phecda",
      "megrez",
      "alioth",
      "mizar",
      "alkaid"
    ],
    lines: [
      line("dubhe", "merak"),
      line("merak", "phecda"),
      line("phecda", "megrez"),
      line("megrez", "alioth"),
      line("alioth", "mizar"),
      line("mizar", "alkaid")
    ],
    region: {
      rightAscensionMin: hours(8.0),
      rightAscensionMax: hours(14.8),
      declinationMin: degrees(28),
      declinationMax: degrees(73)
    }
  },

  {
    id: "umi",
    abbreviation: "UMi",
    name: "Ursa Minor",
    genitive: "Ursae Minoris",
    hemisphere: "northern",
    areaSquareDegrees: 255.864,
    label: coordinate(15.0, 78),
    stars: [
      "polaris",
      "kochab",
      "pherkad",
      "yildun",
      "epsilon-umi"
    ],
    lines: [
      line("polaris", "yildun"),
      line("yildun", "pherkad"),
      line("pherkad", "kochab"),
      line("kochab", "epsilon-umi")
    ],
    region: {
      rightAscensionMin: hours(0),
      rightAscensionMax: hours(24),
      declinationMin: degrees(65),
      declinationMax: degrees(90)
    }
  },

  {
    id: "vir",
    abbreviation: "Vir",
    name: "Virgo",
    genitive: "Virginis",
    hemisphere: "equatorial",
    areaSquareDegrees: 1294.428,
    label: coordinate(13.3, -2),
    stars: [
      "spica",
      "zavijava",
      "porrima",
      "vindemiatrix",
      "zaniah"
    ],
    lines: [
      line("spica", "zavijava"),
      line("zavijava", "porrima"),
      line("porrima", "zaniah"),
      line("porrima", "vindemiatrix")
    ],
    region: {
      rightAscensionMin: hours(11.5),
      rightAscensionMax: hours(15.1),
      declinationMin: degrees(-22),
      declinationMax: degrees(15)
    }
  },

  {
    id: "vul",
    abbreviation: "Vul",
    name: "Vulpecula",
    genitive: "Vulpeculae",
    hemisphere: "northern",
    areaSquareDegrees: 268.165,
    label: coordinate(20.2, 24),
    stars: [
      "alpha-vul",
      "31-vul",
      "13-vul"
    ],
    lines: [
      line("alpha-vul", "31-vul"),
      line("31-vul", "13-vul")
    ],
    region: {
      rightAscensionMin: hours(18.9),
      rightAscensionMax: hours(21.4),
      declinationMin: degrees(19),
      declinationMax: degrees(29)
    }
  }
];

/* -------------------------------------------------------------------------- */
/* Index                                                                       */
/* -------------------------------------------------------------------------- */

const constellationMap =
  new Map<
    ConstellationId,
    Constellation
  >(
    CONSTELLATIONS.map(
      constellation => [
        constellation.id,
        constellation
      ]
    )
  );

/* -------------------------------------------------------------------------- */
/* Lookup                                                                      */
/* -------------------------------------------------------------------------- */

export function getConstellation(
  id: ConstellationId
): Constellation |
  undefined {
  return constellationMap.get(
    id
  );
}

export function findConstellation(
  query: string
): Constellation[] {
  const normalized =
    query
      .trim()
      .toLowerCase();

  if (
    !normalized
  ) {
    return [];
  }

  return CONSTELLATIONS.filter(
    constellation =>
      constellation.id
        .toLowerCase()
        .includes(
          normalized
        ) ||

      constellation.abbreviation
        .toLowerCase()
        .includes(
          normalized
        ) ||

      constellation.name
        .toLowerCase()
        .includes(
          normalized
        ) ||

      constellation.genitive
        .toLowerCase()
        .includes(
          normalized
        )
  );
}

/* -------------------------------------------------------------------------- */
/* Membership                                                                  */
/* -------------------------------------------------------------------------- */

export function constellationContainsStar(
  constellation: ConstellationId,
  starId: string
): boolean {
  const definition =
    getConstellation(
      constellation
    );

  if (
    !definition
  ) {
    return false;
  }

  return definition.stars.includes(
    starId
  );
}

export function constellationsForStar(
  starId: string
): Constellation[] {
  return CONSTELLATIONS.filter(
    constellation =>
      constellation.stars.includes(
        starId
      )
  );
}

/* -------------------------------------------------------------------------- */
/* Sky region                                                                  */
/* -------------------------------------------------------------------------- */

function rightAscensionInRange(
  ra: number,
  min: number,
  max: number
): boolean {
  const normalizedRA =
    normalizeRA(ra);

  const normalizedMin =
    normalizeRA(min);

  const normalizedMax =
    normalizeRA(max);

  if (
    normalizedMin <=
    normalizedMax
  ) {
    return (
      normalizedRA >=
        normalizedMin &&
      normalizedRA <=
        normalizedMax
    );
  }

  return (
    normalizedRA >=
      normalizedMin ||
    normalizedRA <=
      normalizedMax
  );
}

export function coordinateInConstellationRegion(
  coordinateValue: SkyCoordinate,
  constellation: Constellation
): boolean {
  const region =
    constellation.region;

  const raMatch =
    rightAscensionInRange(
      coordinateValue.rightAscension,
      region.rightAscensionMin,
      region.rightAscensionMax
    );

  const decMatch =
    coordinateValue.declination >=
      region.declinationMin &&
    coordinateValue.declination <=
      region.declinationMax;

  return (
    raMatch &&
    decMatch
  );
}

/**
 * Returns all approximate constellation regions
 * containing a coordinate.
 *
 * Region matching is intentionally approximate.
 * Exact IAU boundary polygons can be plugged in later.
 */
export function constellationsAt(
  coordinateValue: SkyCoordinate
): Constellation[] {
  return CONSTELLATIONS.filter(
    constellation =>
      coordinateInConstellationRegion(
        coordinateValue,
        constellation
      )
  );
}

/* -------------------------------------------------------------------------- */
/* Hemisphere                                                                  */
/* -------------------------------------------------------------------------- */

export function constellationsByHemisphere(
  hemisphere:
    | "northern"
    | "southern"
    | "equatorial"
): Constellation[] {
  return CONSTELLATIONS.filter(
    constellation =>
      constellation.hemisphere ===
      hemisphere
  );
}

/* -------------------------------------------------------------------------- */
/* Sky-map rendering data                                                      */
/* -------------------------------------------------------------------------- */

export interface ConstellationRenderLine {
  constellation:
    ConstellationId;

  from:
    string;

  to:
    string;
}

export function constellationLines(
  constellation:
    ConstellationId
): ConstellationRenderLine[] {
  const definition =
    getConstellation(
      constellation
    );

  if (
    !definition
  ) {
    return [];
  }

  return definition.lines.map(
    segment => ({
      constellation:
        definition.id,

      from:
        segment.from,

      to:
        segment.to
    })
  );
}

export function allConstellationLines():
  ConstellationRenderLine[] {
  const result:
    ConstellationRenderLine[] = [];

  for (
    const constellation
      of CONSTELLATIONS
  ) {
    for (
      const segment
        of constellation.lines
    ) {
      result.push({
        constellation:
          constellation.id,

        from:
          segment.from,

        to:
          segment.to
      });
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                      */
/* -------------------------------------------------------------------------- */

export interface ConstellationLabel {
  id: ConstellationId;

  text: string;

  rightAscension: number;

  declination: number;
}

export function constellationLabels():
  ConstellationLabel[] {
  return CONSTELLATIONS.map(
    constellation => ({
      id:
        constellation.id,

      text:
        constellation.abbreviation,

      rightAscension:
        constellation.label
          .rightAscension,

      declination:
        constellation.label
          .declination
    })
  );
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                  */
/* -------------------------------------------------------------------------- */

export interface ConstellationVisibility {
  constellation:
    ConstellationId;

  visibleStars:
    number;

  totalStars:
    number;

  visibility:
    number;
}

/**
 * Estimate constellation visibility from
 * supplied visible star identifiers.
 */
export function constellationVisibility(
  constellation:
    ConstellationId,
  visibleStarIds:
    ReadonlySet<string>
): ConstellationVisibility {
  const definition =
    getConstellation(
      constellation
    );

  if (
    !definition
  ) {
    return {
      constellation,

      visibleStars: 0,

      totalStars: 0,

      visibility: 0
    };
  }

  let visibleStars = 0;

  for (
    const starId
      of definition.stars
  ) {
    if (
      visibleStarIds.has(
        starId
      )
    ) {
      visibleStars++;
    }
  }

  const totalStars =
    definition.stars.length;

  return {
    constellation,

    visibleStars,

    totalStars,

    visibility:
      totalStars === 0
        ? 0
        : visibleStars /
          totalStars
  };
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                  */
/* -------------------------------------------------------------------------- */

export function constellationCount():
  number {
  return CONSTELLATIONS.length;
}

export function constellationArea(
  id: ConstellationId
): number {
  return (
    getConstellation(id)
      ?.areaSquareDegrees ??
    0
  );
}

export function largestConstellations(
  limit = 10
): Constellation[] {
  return [
    ...CONSTELLATIONS
  ]
    .sort(
      (
        a,
        b
      ) =>
        b.areaSquareDegrees -
        a.areaSquareDegrees
    )
    .slice(
      0,
      limit
    );
}

/* -------------------------------------------------------------------------- */
/* Catalog integration                                                         */
/* -------------------------------------------------------------------------- */

export interface ConstellationStarResolver {
  resolve(
    id: string
  ): SkyCoordinate |
    undefined;
}

/**
 * Resolve all line endpoints to coordinates.
 *
 * This is renderer-friendly and intentionally does
 * not depend on a specific star catalog implementation.
 */
export function resolveConstellationLines(
  constellation:
    ConstellationId,
  resolver:
    ConstellationStarResolver
): Array<{
  from: SkyCoordinate;
  to: SkyCoordinate;
}> {
  const definition =
    getConstellation(
      constellation
    );

  if (
    !definition
  ) {
    return [];
  }

  const result:
    Array<{
      from: SkyCoordinate;
      to: SkyCoordinate;
    }> = [];

  for (
    const segment
      of definition.lines
  ) {
    const from =
      resolver.resolve(
        segment.from
      );

    const to =
      resolver.resolve(
        segment.to
      );

    if (
      from &&
      to
    ) {
      result.push({
        from,
        to
      });
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Serialization                                                               */
/* -------------------------------------------------------------------------- */

export interface SerializedConstellation {
  id: string;

  abbreviation: string;

  name: string;

  genitive: string;

  hemisphere: string;

  areaSquareDegrees: number;

  label: {
    rightAscension: number;
    declination: number;
  };

  stars: string[];

  lines: Array<{
    from: string;
    to: string;
  }>;
}

export function serializeConstellation(
  constellation:
    Constellation
): SerializedConstellation {
  return {
    id:
      constellation.id,

    abbreviation:
      constellation.abbreviation,

    name:
      constellation.name,

    genitive:
      constellation.genitive,

    hemisphere:
      constellation.hemisphere,

    areaSquareDegrees:
      constellation.areaSquareDegrees,

    label: {
      rightAscension:
        constellation.label
          .rightAscension,

      declination:
        constellation.label
          .declination
    },

    stars: [
      ...constellation.stars
    ],

    lines:
      constellation.lines.map(
        segment => ({
          from:
            segment.from,

          to:
            segment.to
        })
      )
  };
}

/* -------------------------------------------------------------------------- */
/* Default API                                                                 */
/* -------------------------------------------------------------------------- */

export const Constellations = {
  all:
    CONSTELLATIONS,

  count:
    constellationCount,

  get:
    getConstellation,

  find:
    findConstellation,

  at:
    constellationsAt,

  forStar:
    constellationsForStar,

  containsStar:
    constellationContainsStar,

  byHemisphere:
    constellationsByHemisphere,

  lines:
    constellationLines,

  allLines:
    allConstellationLines,

  labels:
    constellationLabels,

  visibility:
    constellationVisibility,

  area:
    constellationArea,

  largest:
    largestConstellations,

  resolveLines:
    resolveConstellationLines,

  serialize:
    serializeConstellation
} as const;
