/**
 * Space
 * Rendering Layers
 *
 * Manages render layers and their ordering.
 *
 * Typical layers:
 *
 *   background
 *   stars
 *   deep-space
 *   grid
 *   orbits
 *   bodies
 *   atmosphere
 *   trajectories
 *   labels
 *   markers
 *   effects
 *   overlays
 *
 * Layers are intentionally generic. The library does not
 * force a particular visual representation.
 */

import type {
  RenderContext,
  RenderLayer,
  RenderableObject,
  SceneRenderStats
} from "../types/rendering";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LayerOptions {
  id: string;

  name?: string;

  order?: number;

  visible?: boolean;

  opacity?: number;

  enabled?: boolean;
}

export interface LayerState {
  id: string;

  name: string;

  order: number;

  visible: boolean;

  enabled: boolean;

  opacity: number;

  objectCount: number;
}

export interface LayerRenderResult {
  layer:
    string;

  objects:
    number;

  visibleObjects:
    number;

  drawCalls:
    number;

  triangles:
    number;
}

/* -------------------------------------------------------------------------- */
/* Default layers                                                             */
/* -------------------------------------------------------------------------- */

export const DEFAULT_RENDER_LAYERS:
  LayerOptions[] = [
    {
      id:
        "background",

      name:
        "Background",

      order:
        0
    },

    {
      id:
        "stars",

      name:
        "Stars",

      order:
        10
    },

    {
      id:
        "deep-space",

      name:
        "Deep Space",

      order:
        20
    },

    {
      id:
        "grid",

      name:
        "Grid",

      order:
        30
    },

    {
      id:
        "orbits",

      name:
        "Orbits",

      order:
        40
    },

    {
      id:
        "bodies",

      name:
        "Celestial Bodies",

      order:
        50
    },

    {
      id:
        "atmosphere",

      name:
        "Atmosphere",

      order:
        60
    },

    {
      id:
        "trajectories",

      name:
        "Trajectories",

      order:
        70
    },

    {
      id:
        "labels",

      name:
        "Labels",

      order:
        80
    },

    {
      id:
        "markers",

      name:
        "Markers",

      order:
        90
    },

    {
      id:
        "effects",

      name:
        "Effects",

      order:
        100
    },

    {
      id:
        "overlays",

      name:
        "Overlays",

      order:
        110
    }
  ];

/* -------------------------------------------------------------------------- */
/* Layer Manager                                                              */
/* -------------------------------------------------------------------------- */

export class RenderLayerManager {
  private readonly layers =
    new Map<
      string,
      RenderLayer
    >();

  private readonly objects =
    new Map<
      string,
      Set<string>
    >();

  private readonly objectLayers =
    new Map<
      string,
      string
    >();

  private sortedLayers:
    RenderLayer[] = [];

  private dirty =
    true;

  constructor(
    layers:
      LayerOptions[] =
        DEFAULT_RENDER_LAYERS
  ) {
    for (
      const layer of layers
    ) {
      this.create(
        layer
      );
    }

    this.sort();
  }

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  create(
    options: LayerOptions
  ): RenderLayer {
    if (
      this.layers.has(
        options.id
      )
    ) {
      throw new Error(
        `Render layer "${options.id}" already exists.`
      );
    }

    const layer:
      RenderLayer = {
        id:
          options.id,

        name:
          options.name ??
          options.id,

        order:
          options.order ??
          0,

        visible:
          options.visible ??
          true,

        enabled:
          options.enabled ??
          true,

        opacity:
          options.opacity ??
          1
      };

    this.layers.set(
      layer.id,
      layer
    );

    this.objects.set(
      layer.id,
      new Set()
    );

    this.dirty =
      true;

    return layer;
  }

  /* ------------------------------------------------------------------------ */
  /* Remove                                                                   */
  /* ------------------------------------------------------------------------ */

  remove(
    id: string
  ): boolean {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return false;
    }

    const objectIds =
      this.objects.get(
        id
      );

    if (
      objectIds
    ) {
      for (
        const objectId of
        objectIds
      ) {
        this.objectLayers.delete(
          objectId
        );
      }
    }

    this.objects.delete(
      id
    );

    this.layers.delete(
      id
    );

    this.dirty =
      true;

    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* Get                                                                      */
  /* ------------------------------------------------------------------------ */

  get(
    id: string
  ):
    RenderLayer | undefined {
    return this.layers.get(
      id
    );
  }

  has(
    id: string
  ): boolean {
    return this.layers.has(
      id
    );
  }

  getAll():
    RenderLayer[] {
    this.sort();

    return [
      ...this.sortedLayers
    ];
  }

  /* ------------------------------------------------------------------------ */
  /* Ordering                                                                 */
  /* ------------------------------------------------------------------------ */

  setOrder(
    id: string,
    order: number
  ): void {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return;
    }

    layer.order =
      order;

    this.dirty =
      true;
  }

  private sort(): void {
    if (
      !this.dirty
    ) {
      return;
    }

    this.sortedLayers =
      Array.from(
        this.layers.values()
      ).sort(
        (
          a,
          b
        ) =>
          a.order -
          b.order
      );

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Visibility                                                               */
  /* ------------------------------------------------------------------------ */

  setVisible(
    id: string,
    visible: boolean
  ): void {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return;
    }

    layer.visible =
      visible;
  }

  show(
    id: string
  ): void {
    this.setVisible(
      id,
      true
    );
  }

  hide(
    id: string
  ): void {
    this.setVisible(
      id,
      false
    );
  }

  toggle(
    id: string
  ): void {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return;
    }

    layer.visible =
      !layer.visible;
  }

  /* ------------------------------------------------------------------------ */
  /* Enabled                                                                  */
  /* ------------------------------------------------------------------------ */

  setEnabled(
    id: string,
    enabled: boolean
  ): void {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return;
    }

    layer.enabled =
      enabled;
  }

  /* ------------------------------------------------------------------------ */
  /* Opacity                                                                  */
  /* ------------------------------------------------------------------------ */

  setOpacity(
    id: string,
    opacity: number
  ): void {
    const layer =
      this.layers.get(
        id
      );

    if (!layer) {
      return;
    }

    layer.opacity =
      Math.max(
        0,
        Math.min(
          1,
          opacity
        )
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Object assignment                                                        */
  /* ------------------------------------------------------------------------ */

  addObject(
    object:
      RenderableObject,
    layerId =
      "bodies"
  ): void {
    if (
      !this.layers.has(
        layerId
      )
    ) {
      throw new Error(
        `Render layer "${layerId}" does not exist.`
      );
    }

    this.removeObject(
      object.id
    );

    this.objects
      .get(layerId)!
      .add(
        object.id
      );

    this.objectLayers.set(
      object.id,
      layerId
    );
  }

  removeObject(
    objectId: string
  ): void {
    const currentLayer =
      this.objectLayers.get(
        objectId
      );

    if (
      !currentLayer
    ) {
      return;
    }

    this.objects
      .get(
        currentLayer
      )
      ?.delete(
        objectId
      );

    this.objectLayers.delete(
      objectId
    );
  }

  moveObject(
    objectId: string,
    layerId: string
  ): void {
    if (
      !this.layers.has(
        layerId
      )
    ) {
      throw new Error(
        `Render layer "${layerId}" does not exist.`
      );
    }

    this.removeObject(
      objectId
    );

    this.objects
      .get(
        layerId
      )!
      .add(
        objectId
      );

    this.objectLayers.set(
      objectId,
      layerId
    );
  }

  getObjectLayer(
    objectId: string
  ):
    string | undefined {
    return this.objectLayers.get(
      objectId
    );
  }

  getLayerObjects(
    layerId: string
  ):
    string[] {
    return Array.from(
      this.objects.get(
        layerId
      ) ?? []
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Rendering                                                                */
  /* ------------------------------------------------------------------------ */

  render(
    context: RenderContext,
    objects:
      Map<
        string,
        RenderableObject
      >
  ):
    LayerRenderResult[] {
    this.sort();

    const results:
      LayerRenderResult[] =
      [];

    for (
      const layer of
      this.sortedLayers
    ) {
      if (
        !layer.enabled ||
        !layer.visible
      ) {
        continue;
      }

      const ids =
        this.objects.get(
          layer.id
        );

      if (!ids) {
        continue;
      }

      let objectCount = 0;
      let visibleObjects = 0;
      let drawCalls = 0;
      let triangles = 0;

      for (
        const id of ids
      ) {
        const object =
          objects.get(
            id
          );

        if (!object) {
          continue;
        }

        objectCount++;

        if (
          object.isVisible &&
          !object.isVisible(
            context
          )
        ) {
          continue;
        }

        visibleObjects++;

        object.render(
          context
        );

        if (
          object.getRenderStats
        ) {
          const stats =
            object.getRenderStats();

          drawCalls +=
            stats.drawCalls;

          triangles +=
            stats.triangles;
        }
      }

      results.push({
        layer:
          layer.id,

        objects:
          objectCount,

        visibleObjects,

        drawCalls,

        triangles
      });
    }

    return results;
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  getState():
    LayerState[] {
    this.sort();

    return this.sortedLayers.map(
      layer => ({
        id:
          layer.id,

        name:
          layer.name,

        order:
          layer.order,

        visible:
          layer.visible,

        enabled:
          layer.enabled,

        opacity:
          layer.opacity,

        objectCount:
          this.objects.get(
            layer.id
          )?.size ?? 0
      })
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Utilities                                                                */
  /* ------------------------------------------------------------------------ */

  clearObjects(
    layerId: string
  ): void {
    const objectIds =
      this.objects.get(
        layerId
      );

    if (!objectIds) {
      return;
    }

    for (
      const id of
      objectIds
    ) {
      this.objectLayers.delete(
        id
      );
    }

    objectIds.clear();
  }

  clear(): void {
    for (
      const ids of
      this.objects.values()
    ) {
      ids.clear();
    }

    this.objectLayers.clear();
  }

  get size(): number {
    return this.layers.size;
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose(): void {
    this.layers.clear();

    this.objects.clear();

    this.objectLayers.clear();

    this.sortedLayers = [];

    this.dirty =
      true;
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRenderLayerManager(
  layers?: LayerOptions[]
): RenderLayerManager {
  return new RenderLayerManager(
    layers
  );
}

export default RenderLayerManager;
