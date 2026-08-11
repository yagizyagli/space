/**
 * Space
 * Rendering Level of Detail
 *
 * Distance / screen-size based LOD management.
 *
 * Supports:
 * - Distance based LOD
 * - Screen-space error
 * - Hysteresis
 * - LOD groups
 * - Per-object LOD selection
 * - Batch LOD evaluation
 * - Runtime LOD statistics
 */

import type {
  Vector3,
  Camera
} from "../types/core";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LODLevel<T = unknown> {
  level:
    number;

  value:
    T;

  minDistance:
    number;

  maxDistance:
    number;

  screenSize?:
    number;

  hysteresis?:
    number;
}

export interface LODOptions<T = unknown> {
  id?: string;

  name?: string;

  levels:
    LODLevel<T>[];

  hysteresis?:
    number;

  enabled?:
    boolean;

  strategy?:
    LODStrategy;
}

export type LODStrategy =
  | "distance"
  | "screen-size";

export interface LODSelection<T = unknown> {
  level:
    number;

  value:
    T;

  distance:
    number;

  screenSize:
    number;

  changed:
    boolean;
}

export interface LODObject<T = unknown> {
  id:
    string;

  position:
    Vector3;

  radius?:
    number;

  lod:
    LODGroup<T>;
}

/* -------------------------------------------------------------------------- */
/* Math Helpers                                                               */
/* -------------------------------------------------------------------------- */

function distance(
  a:
    Vector3,
  b:
    Vector3
):
  number {
  const dx =
    a.x - b.x;

  const dy =
    a.y - b.y;

  const dz =
    a.z - b.z;

  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  );
}

/* -------------------------------------------------------------------------- */
/* LOD Group                                                                  */
/* -------------------------------------------------------------------------- */

export class LODGroup<T = unknown> {

  readonly id:
    string;

  private name:
    string;

  private levels:
    LODLevel<T>[];

  private hysteresis:
    number;

  private enabled:
    boolean;

  private strategy:
    LODStrategy;

  private currentLevel =
    -1;

  private disposed =
    false;

  constructor(
    options:
      LODOptions<T>
  ) {
    this.id =
      options.id ??
      `lod-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    this.name =
      options.name ??
      this.id;

    this.levels =
      this.normalizeLevels(
        options.levels
      );

    if (
      this.levels.length ===
      0
    ) {
      throw new Error(
        "LODGroup requires at least one level."
      );
    }

    this.hysteresis =
      Math.max(
        0,
        options.hysteresis ??
          0
      );

    this.enabled =
      options.enabled ??
      true;

    this.strategy =
      options.strategy ??
      "distance";
  }

  /* ------------------------------------------------------------------------ */
  /* Levels                                                                   */
  /* ------------------------------------------------------------------------ */

  addLevel(
    level:
      LODLevel<T>
  ):
    void {
    this.assertActive();

    this.levels.push(
      {
        ...level
      }
    );

    this.levels =
      this.normalizeLevels(
        this.levels
      );
  }

  removeLevel(
    level:
      number
  ):
    boolean {
    const index =
      this.levels.findIndex(
        item =>
          item.level ===
          level
      );

    if (
      index === -1
    ) {
      return false;
    }

    this.levels.splice(
      index,
      1
    );

    if (
      this.levels.length ===
      0
    ) {
      this.currentLevel =
        -1;
    } else if (
      this.currentLevel >=
      this.levels.length
    ) {
      this.currentLevel =
        this.levels.length - 1;
    }

    return true;
  }

  getLevel(
    level:
      number
  ):
    LODLevel<T> |
    undefined {
    return this.levels.find(
      item =>
        item.level ===
        level
    );
  }

  getLevels():
    LODLevel<T>[] {
    return this.levels.map(
      level => ({
        ...level
      })
    );
  }

  getLevelCount():
    number {
    return this.levels.length;
  }

  /* ------------------------------------------------------------------------ */
  /* Selection                                                                 */
  /* ------------------------------------------------------------------------ */

  select(
    cameraPosition:
      Vector3,
    objectPosition:
      Vector3,
    radius:
      number =
        1
  ):
    LODSelection<T> {
    this.assertActive();

    const objectDistance =
      distance(
        cameraPosition,
        objectPosition
      );

    const screenSize =
      this.calculateScreenSize(
        objectDistance,
        radius
      );

    if (
      !this.enabled
    ) {
      const level =
        this.levels[0];

      return {
        level:
          level.level,

        value:
          level.value,

        distance:
          objectDistance,

        screenSize,

        changed:
          this.currentLevel !==
          level.level
      };
    }

    const selected =
      this.strategy ===
      "screen-size"
        ? this.selectByScreenSize(
            screenSize
          )
        : this.selectByDistance(
            objectDistance
          );

    const changed =
      this.currentLevel !==
      selected.level;

    this.currentLevel =
      selected.level;

    return {
      level:
        selected.level,

      value:
        selected.value,

      distance:
        objectDistance,

      screenSize,

      changed
    };
  }

  selectByDistance(
    value:
      number
  ):
    LODLevel<T> {
    let selected =
      this.levels[
        this.levels.length - 1
      ];

    for (
      const level of
      this.levels
    ) {
      if (
        value >=
          level.minDistance &&
        value <=
          level.maxDistance
      ) {
        selected =
          level;

        break;
      }
    }

    return selected;
  }

  selectByScreenSize(
    screenSize:
      number
  ):
    LODLevel<T> {
    let selected =
      this.levels[
        this.levels.length - 1
      ];

    for (
      const level of
      this.levels
    ) {
      if (
        level.screenSize ===
        undefined
      ) {
        continue;
      }

      if (
        screenSize >=
        level.screenSize
      ) {
        selected =
          level;

        break;
      }
    }

    return selected;
  }

  /* ------------------------------------------------------------------------ */
  /* Current Level                                                             */
  /* ------------------------------------------------------------------------ */

  getCurrentLevel():
    number {
    return this.currentLevel;
  }

  getCurrentValue():
    T |
    undefined {
    if (
      this.currentLevel < 0
    ) {
      return undefined;
    }

    return this.levels[
      this.currentLevel
    ]?.value;
  }

  reset():
    void {
    this.currentLevel =
      -1;
  }

  /* ------------------------------------------------------------------------ */
  /* Configuration                                                            */
  /* ------------------------------------------------------------------------ */

  setEnabled(
    enabled:
      boolean
  ):
    void {
    this.enabled =
      enabled;
  }

  isEnabled():
    boolean {
    return this.enabled;
  }

  setStrategy(
    strategy:
      LODStrategy
  ):
    void {
    this.strategy =
      strategy;
  }

  getStrategy():
    LODStrategy {
    return this.strategy;
  }

  setHysteresis(
    value:
      number
  ):
    void {
    this.hysteresis =
      Math.max(
        0,
        value
      );
  }

  getHysteresis():
    number {
    return this.hysteresis;
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private calculateScreenSize(
    distanceValue:
      number,
    radius:
      number
  ):
    number {
    if (
      distanceValue <=
      0
    ) {
      return Infinity;
    }

    return (
      radius /
      distanceValue
    );
  }

  private normalizeLevels(
    levels:
      LODLevel<T>[]
  ):
    LODLevel<T>[] {
    return [
      ...levels
    ]
      .map(
        level => ({
          ...level,

          minDistance:
            Math.max(
              0,
              level.minDistance
            ),

          maxDistance:
            Math.max(
              level.minDistance,
              level.maxDistance
            )
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.minDistance -
          b.minDistance
      );
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `LODGroup "${this.id}" has been disposed.`
      );
    }
  }

  dispose():
    void {
    this.levels =
      [];

    this.currentLevel =
      -1;

    this.disposed =
      true;
  }
}

/* -------------------------------------------------------------------------- */
/* LOD Manager                                                                */
/* -------------------------------------------------------------------------- */

export class LODManager<T = unknown> {

  private groups =
    new Map<
      string,
      LODGroup<T>
    >();

  private lastSelections =
    new Map<
      string,
      LODSelection<T>
    >();

  register(
    group:
      LODGroup<T>
  ):
    void {
    if (
      this.groups.has(
        group.id
      )
    ) {
      throw new Error(
        `LOD group "${group.id}" already exists.`
      );
    }

    this.groups.set(
      group.id,
      group
    );
  }

  get(
    id:
      string
  ):
    LODGroup<T> |
    undefined {
    return this.groups.get(
      id
    );
  }

  remove(
    id:
      string
  ):
    boolean {
    const group =
      this.groups.get(
        id
      );

    if (
      !group
    ) {
      return false;
    }

    group.dispose();

    this.lastSelections.delete(
      id
    );

    return this.groups.delete(
      id
    );
  }

  select(
    groupId:
      string,
    cameraPosition:
      Vector3,
    objectPosition:
      Vector3,
    radius:
      number =
        1
  ):
    LODSelection<T> {
    const group =
      this.groups.get(
        groupId
      );

    if (
      !group
    ) {
      throw new Error(
        `LOD group "${groupId}" does not exist.`
      );
    }

    const selection =
      group.select(
        cameraPosition,
        objectPosition,
        radius
      );

    this.lastSelections.set(
      groupId,
      selection
    );

    return selection;
  }

  selectMany(
    objects:
      LODObject<T>[],
    camera:
      Camera
  ):
    LODSelection<T>[] {
    const results:
      LODSelection<T>[] =
      [];

    for (
      const object of
      objects
    ) {
      const selection =
        object.lod.select(
          camera.position,
          object.position,
          object.radius ??
            1
        );

      this.lastSelections.set(
        object.lod.id,
        selection
      );

      results.push(
        selection
      );
    }

    return results;
  }

  getLastSelection(
    groupId:
      string
  ):
    LODSelection<T> |
    undefined {
    return this.lastSelections.get(
      groupId
    );
  }

  clear():
    void {
    for (
      const group of
      this.groups.values()
    ) {
      group.dispose();
    }

    this.groups.clear();

    this.lastSelections.clear();
  }

  get size():
    number {
    return this.groups.size;
  }
}

/* -------------------------------------------------------------------------- */
/* Presets                                                                    */
/* -------------------------------------------------------------------------- */

export function createDistanceLOD<T>(
  levels:
    LODLevel<T>[],
  options:
    Omit<
      LODOptions<T>,
      "levels" |
      "strategy"
    > = {}
):
  LODGroup<T> {
  return new LODGroup({
    ...options,

    levels,

    strategy:
      "distance"
  });
}

export function createScreenSizeLOD<T>(
  levels:
    LODLevel<T>[],
  options:
    Omit<
      LODOptions<T>,
      "levels" |
      "strategy"
    > = {}
):
  LODGroup<T> {
  return new LODGroup({
    ...options,

    levels,

    strategy:
      "screen-size"
  });
}

export function createLODManager<T = unknown>():
  LODManager<T> {
  return new LODManager<T>();
}

/* -------------------------------------------------------------------------- */
/* Default Space LOD                                                          */
/* -------------------------------------------------------------------------- */

export function createSpaceObjectLOD<T>(
  high:
    T,
  medium:
    T,
  low:
    T,
  distant:
    T
):
  LODGroup<T> {
  return createDistanceLOD([
    {
      level:
        0,

      value:
        high,

      minDistance:
        0,

      maxDistance:
        100
    },

    {
      level:
        1,

      value:
        medium,

      minDistance:
        100,

      maxDistance:
        500
    },

    {
      level:
        2,

      value:
        low,

      minDistance:
        500,

      maxDistance:
        2500
    },

    {
      level:
        3,

      value:
        distant,

      minDistance:
        2500,

      maxDistance:
        Infinity
    }
  ]);
}

export default LODGroup;
