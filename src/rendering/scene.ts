/**
 * Space
 * Rendering Scene
 *
 * Rendering-side scene management.
 *
 * Responsibilities:
 * - Renderable object registration
 * - Visibility management
 * - Layer ordering
 * - Render traversal
 * - Scene bounds
 * - Render statistics
 *
 * This class intentionally stays independent from:
 * - UI
 * - DOM
 * - Astronomy calculations
 * - Application state
 */

import type {
  RenderFrame,
  RenderContext,
  RenderableObject,
  RenderLayer,
  SceneRenderStats
} from "../types/rendering";

export interface SceneOptions {
  autoSortLayers?: boolean;

  cullingEnabled?: boolean;
}

export interface SceneNode {
  id: string;

  object: RenderableObject;

  visible: boolean;

  layer: number;

  renderOrder: number;
}

export class RenderScene {
  private readonly nodes =
    new Map<string, SceneNode>();

  private readonly layers =
    new Map<number, RenderLayer>();

  private readonly autoSortLayers: boolean;

  private readonly cullingEnabled: boolean;

  private sortedNodes: SceneNode[] = [];

  private dirty = true;

  private stats: SceneRenderStats = {
    objects:
      0,

    visibleObjects:
      0,

    culledObjects:
      0,

    drawCalls:
      0,

    triangles:
      0
  };

  constructor(
    options: SceneOptions = {}
  ) {
    this.autoSortLayers =
      options.autoSortLayers ??
      true;

    this.cullingEnabled =
      options.cullingEnabled ??
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Objects                                                                  */
  /* ------------------------------------------------------------------------ */

  add(
    object: RenderableObject,
    options: Partial<
      Omit<SceneNode, "object" | "id">
    > = {}
  ): this {
    const node: SceneNode = {
      id:
        object.id,

      object,

      visible:
        options.visible ??
        true,

      layer:
        options.layer ??
        0,

      renderOrder:
        options.renderOrder ??
        0
    };

    this.nodes.set(
      node.id,
      node
    );

    this.dirty =
      true;

    return this;
  }

  remove(
    id: string
  ): boolean {
    const removed =
      this.nodes.delete(
        id
      );

    if (removed) {
      this.dirty =
        true;
    }

    return removed;
  }

  removeObject(
    object: RenderableObject
  ): boolean {
    return this.remove(
      object.id
    );
  }

  has(
    id: string
  ): boolean {
    return this.nodes.has(
      id
    );
  }

  get(
    id: string
  ): SceneNode | undefined {
    return this.nodes.get(
      id
    );
  }

  getObject(
    id: string
  ):
    RenderableObject | undefined {
    return this.nodes.get(
      id
    )?.object;
  }

  clear(): void {
    this.nodes.clear();

    this.sortedNodes = [];

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Visibility                                                               */
  /* ------------------------------------------------------------------------ */

  setVisible(
    id: string,
    visible: boolean
  ): void {
    const node =
      this.nodes.get(
        id
      );

    if (!node) {
      return;
    }

    node.visible =
      visible;

    this.dirty =
      true;
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

  toggleVisibility(
    id: string
  ): void {
    const node =
      this.nodes.get(
        id
      );

    if (!node) {
      return;
    }

    node.visible =
      !node.visible;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Layers                                                                   */
  /* ------------------------------------------------------------------------ */

  addLayer(
    layer: RenderLayer
  ): this {
    this.layers.set(
      layer.id,
      layer
    );

    this.dirty =
      true;

    return this;
  }

  removeLayer(
    id: string
  ): boolean {
    const removed =
      this.layers.delete(
        id
      );

    if (removed) {
      this.dirty =
        true;
    }

    return removed;
  }

  getLayer(
    id: string
  ):
    RenderLayer | undefined {
    return this.layers.get(
      id
    );
  }

  setLayer(
    id: string,
    layer: number
  ): void {
    const node =
      this.nodes.get(
        id
      );

    if (!node) {
      return;
    }

    node.layer =
      layer;

    this.dirty =
      true;
  }

  /* ------------------------------------------------------------------------ */
  /* Render order                                                             */
  /* ------------------------------------------------------------------------ */

  setRenderOrder(
    id: string,
    order: number
  ): void {
    const node =
      this.nodes.get(
        id
      );

    if (!node) {
      return;
    }

    node.renderOrder =
      order;

    this.dirty =
      true;
  }

  private sortNodes(): void {
    if (
      !this.dirty &&
      this.sortedNodes.length ===
        this.nodes.size
    ) {
      return;
    }

    this.sortedNodes =
      Array.from(
        this.nodes.values()
      );

    if (
      this.autoSortLayers
    ) {
      this.sortedNodes.sort(
        (
          a,
          b
        ) => {
          if (
            a.layer !==
            b.layer
          ) {
            return (
              a.layer -
              b.layer
            );
          }

          return (
            a.renderOrder -
            b.renderOrder
          );
        }
      );
    }

    this.dirty =
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Traversal                                                                */
  /* ------------------------------------------------------------------------ */

  traverse(
    callback: (
      node: SceneNode
    ) => void
  ): void {
    this.sortNodes();

    for (
      const node of
      this.sortedNodes
    ) {
      callback(
        node
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  update(
    frame: RenderFrame
  ): void {
    this.sortNodes();

    for (
      const node of
      this.sortedNodes
    ) {
      if (
        !node.visible
      ) {
        continue;
      }

      node.object.update?.(
        frame
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  render(
    context: RenderContext
  ): SceneRenderStats {
    this.sortNodes();

    let objects = 0;
    let visibleObjects = 0;
    let culledObjects = 0;
    let drawCalls = 0;
    let triangles = 0;

    for (
      const node of
      this.sortedNodes
    ) {
      objects++;

      if (
        !node.visible
      ) {
        continue;
      }

      if (
        this.cullingEnabled &&
        node.object.isVisible &&
        !node.object.isVisible(
          context
        )
      ) {
        culledObjects++;
        continue;
      }

      visibleObjects++;

      node.object.render(
        context
      );

      if (
        node.object.getRenderStats
      ) {
        const stats =
          node.object.getRenderStats();

        drawCalls +=
          stats.drawCalls;

        triangles +=
          stats.triangles;
      }
    }

    this.stats = {
      objects,

      visibleObjects,

      culledObjects,

      drawCalls,

      triangles
    };

    return this.stats;
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  getStats():
    SceneRenderStats {
    return {
      ...this.stats
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Collection                                                                */
  /* ------------------------------------------------------------------------ */

  get size(): number {
    return this.nodes.size;
  }

  getObjects():
    RenderableObject[] {
    return Array.from(
      this.nodes.values()
    ).map(
      node =>
        node.object
    );
  }

  getVisibleObjects():
    RenderableObject[] {
    return Array.from(
      this.nodes.values()
    )
      .filter(
        node =>
          node.visible
      )
      .map(
        node =>
          node.object
      );
  }

  getLayers():
    RenderLayer[] {
    return Array.from(
      this.layers.values()
    );
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  markDirty(): void {
    this.dirty =
      true;
  }

  dispose(): void {
    for (
      const node of
      this.nodes.values()
    ) {
      node.object.dispose?.();
    }

    this.nodes.clear();

    this.layers.clear();

    this.sortedNodes = [];

    this.dirty =
      true;
  }
}

export function createRenderScene(
  options?: SceneOptions
): RenderScene {
  return new RenderScene(
    options
  );
}

export default RenderScene;
