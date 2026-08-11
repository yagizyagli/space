/**
 * Space
 * Rendering Debug
 *
 * Development-time rendering diagnostics.
 *
 * Supports:
 * - Bounding boxes
 * - Bounding spheres
 * - Frustum visualization
 * - Draw-call statistics
 * - Culling statistics
 * - LOD statistics
 * - GPU timing metadata
 * - Debug flags
 */

import type {
  Vector3
} from "../types/core";

import type {
  BoundingBox,
  BoundingSphere,
  Frustum
} from "../types/math";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface DebugColor {
  r:
    number;

  g:
    number;

  b:
    number;

  a?:
    number;
}

export interface DebugLine {
  start:
    Vector3;

  end:
    Vector3;

  color:
    DebugColor;

  width?:
    number;
}

export interface DebugPoint {
  position:
    Vector3;

  color:
    DebugColor;

  size?:
    number;
}

export interface DebugBox {
  bounds:
    BoundingBox;

  color:
    DebugColor;

  wireframe?:
    boolean;
}

export interface DebugSphere {
  sphere:
    BoundingSphere;

  color:
    DebugColor;

  segments?:
    number;
}

export interface RenderingDebugStats {
  drawCalls:
    number;

  instancedDrawCalls:
    number;

  triangles:
    number;

  vertices:
    number;

  visibleObjects:
    number;

  culledObjects:
    number;

  lodChanges:
    number;

  textureBinds:
    number;

  shaderSwitches:
    number;

  renderPasses:
    number;

  gpuTimeMs:
    number;

  cpuTimeMs:
    number;
}

export interface DebugOptions {
  enabled?:
    boolean;

  showBounds?:
    boolean;

  showFrustum?:
    boolean;

  showAxes?:
    boolean;

  showPoints?:
    boolean;

  showLines?:
    boolean;

  showStats?:
    boolean;
}

/* -------------------------------------------------------------------------- */
/* Debug Renderer Interface                                                    */
/* -------------------------------------------------------------------------- */

export interface DebugRenderer {
  drawLine(
    line:
      DebugLine
  ):
    void;

  drawPoint(
    point:
      DebugPoint
  ):
    void;

  drawBox(
    box:
      DebugBox
  ):
    void;

  drawSphere(
    sphere:
      DebugSphere
  ):
    void;

  drawFrustum(
    frustum:
      Frustum,
    color:
      DebugColor
  ):
    void;
}

/* -------------------------------------------------------------------------- */
/* Debug System                                                               */
/* -------------------------------------------------------------------------- */

export class RenderingDebug {

  private enabled =
    false;

  private showBounds =
    false;

  private showFrustum =
    false;

  private showAxes =
    false;

  private showPoints =
    false;

  private showLines =
    false;

  private showStats =
    false;

  private lines:
    DebugLine[] =
    [];

  private points:
    DebugPoint[] =
    [];

  private boxes:
    DebugBox[] =
    [];

  private spheres:
    DebugSphere[] =
    [];

  private frustums:
    Array<{
      frustum:
        Frustum;

      color:
        DebugColor;
    }> =
    [];

  private stats:
    RenderingDebugStats = {
      drawCalls:
        0,

      instancedDrawCalls:
        0,

      triangles:
        0,

      vertices:
        0,

      visibleObjects:
        0,

      culledObjects:
        0,

      lodChanges:
        0,

      textureBinds:
        0,

      shaderSwitches:
        0,

      renderPasses:
        0,

      gpuTimeMs:
        0,

      cpuTimeMs:
        0
    };

  private frameStart =
    0;

  private disposed =
    false;

  constructor(
    options:
      DebugOptions = {}
  ) {
    this.enabled =
      options.enabled ??
      false;

    this.showBounds =
      options.showBounds ??
      false;

    this.showFrustum =
      options.showFrustum ??
      false;

    this.showAxes =
      options.showAxes ??
      false;

    this.showPoints =
      options.showPoints ??
      false;

    this.showLines =
      options.showLines ??
      false;

    this.showStats =
      options.showStats ??
      false;
  }

  /* ------------------------------------------------------------------------ */
  /* Configuration                                                            */
  /* ------------------------------------------------------------------------ */

  setEnabled(
    value:
      boolean
  ):
    void {
    this.enabled =
      value;
  }

  isEnabled():
    boolean {
    return this.enabled;
  }

  setShowBounds(
    value:
      boolean
  ):
    void {
    this.showBounds =
      value;
  }

  setShowFrustum(
    value:
      boolean
  ):
    void {
    this.showFrustum =
      value;
  }

  setShowAxes(
    value:
      boolean
  ):
    void {
    this.showAxes =
      value;
  }

  setShowPoints(
    value:
      boolean
  ):
    void {
    this.showPoints =
      value;
  }

  setShowLines(
    value:
      boolean
  ):
    void {
    this.showLines =
      value;
  }

  setShowStats(
    value:
      boolean
  ):
    void {
    this.showStats =
      value;
  }

  /* ------------------------------------------------------------------------ */
  /* Frame                                                                    */
  /* ------------------------------------------------------------------------ */

  beginFrame():
    void {
    this.assertActive();

    if (
      !this.enabled
    ) {
      return;
    }

    this.frameStart =
      typeof performance !==
      "undefined"
        ? performance.now()
        : Date.now();

    this.clearGeometry();

    this.resetStats();
  }

  endFrame():
    void {
    if (
      !this.enabled
    ) {
      return;
    }

    const now =
      typeof performance !==
      "undefined"
        ? performance.now()
        : Date.now();

    this.stats.cpuTimeMs =
      Math.max(
        0,
        now -
          this.frameStart
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Geometry                                                                 */
  /* ------------------------------------------------------------------------ */

  addLine(
    start:
      Vector3,
    end:
      Vector3,
    color:
      DebugColor,
    width:
      number =
        1
  ):
    void {
    if (
      !this.enabled ||
      !this.showLines
    ) {
      return;
    }

    this.lines.push({
      start: {
        ...start
      },

      end: {
        ...end
      },

      color: {
        ...color
      },

      width
    });
  }

  addPoint(
    position:
      Vector3,
    color:
      DebugColor,
    size:
      number =
        4
  ):
    void {
    if (
      !this.enabled ||
      !this.showPoints
    ) {
      return;
    }

    this.points.push({
      position: {
        ...position
      },

      color: {
        ...color
      },

      size
    });
  }

  addBox(
    bounds:
      BoundingBox,
    color:
      DebugColor
  ):
    void {
    if (
      !this.enabled ||
      !this.showBounds
    ) {
      return;
    }

    this.boxes.push({
      bounds,
      color: {
        ...color
      },

      wireframe:
        true
    });
  }

  addSphere(
    sphere:
      BoundingSphere,
    color:
      DebugColor,
    segments:
      number =
        16
  ):
    void {
    if (
      !this.enabled ||
      !this.showBounds
    ) {
      return;
    }

    this.spheres.push({
      sphere,
      color: {
        ...color
      },

      segments
    });
  }

  addFrustum(
    frustum:
      Frustum,
    color:
      DebugColor
  ):
    void {
    if (
      !this.enabled ||
      !this.showFrustum
    ) {
      return;
    }

    this.frustums.push({
      frustum,
      color: {
        ...color
      }
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  resetStats():
    void {
    this.stats.drawCalls =
      0;

    this.stats.instancedDrawCalls =
      0;

    this.stats.triangles =
      0;

    this.stats.vertices =
      0;

    this.stats.visibleObjects =
      0;

    this.stats.culledObjects =
      0;

    this.stats.lodChanges =
      0;

    this.stats.textureBinds =
      0;

    this.stats.shaderSwitches =
      0;

    this.stats.renderPasses =
      0;

    this.stats.gpuTimeMs =
      0;

    this.stats.cpuTimeMs =
      0;
  }

  incrementDrawCalls(
    count:
      number =
        1
  ):
    void {
    this.stats.drawCalls +=
      count;
  }

  incrementInstancedDrawCalls(
    count:
      number =
        1
  ):
    void {
    this.stats.instancedDrawCalls +=
      count;
  }

  addTriangles(
    count:
      number
  ):
    void {
    this.stats.triangles +=
      count;
  }

  addVertices(
    count:
      number
  ):
    void {
    this.stats.vertices +=
      count;
  }

  setVisibleObjects(
    count:
      number
  ):
    void {
    this.stats.visibleObjects =
      count;
  }

  setCulledObjects(
    count:
      number
  ):
    void {
    this.stats.culledObjects =
      count;
  }

  addLODChanges(
    count:
      number
  ):
    void {
    this.stats.lodChanges +=
      count;
  }

  incrementTextureBinds(
    count:
      number =
        1
  ):
    void {
    this.stats.textureBinds +=
      count;
  }

  incrementShaderSwitches(
    count:
      number =
        1
  ):
    void {
    this.stats.shaderSwitches +=
      count;
  }

  incrementRenderPasses(
    count:
      number =
        1
  ):
    void {
    this.stats.renderPasses +=
      count;
  }

  setGPUTime(
    milliseconds:
      number
  ):
    void {
    this.stats.gpuTimeMs =
      Math.max(
        0,
        milliseconds
      );
  }

  getStats():
    RenderingDebugStats {
    return {
      ...this.stats
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                  */
  /* ------------------------------------------------------------------------ */

  getLines():
    DebugLine[] {
    return this.lines.map(
      line => ({
        ...line,

        start: {
          ...line.start
        },

        end: {
          ...line.end
        },

        color: {
          ...line.color
        }
      })
    );
  }

  getPoints():
    DebugPoint[] {
    return this.points.map(
      point => ({
        ...point,

        position: {
          ...point.position
        },

        color: {
          ...point.color
        }
      })
    );
  }

  getBoxes():
    DebugBox[] {
    return this.boxes.map(
      box => ({
        ...box,

        color: {
          ...box.color
        }
      })
    );
  }

  getSpheres():
    DebugSphere[] {
    return this.spheres.map(
      sphere => ({
        ...sphere,

        color: {
          ...sphere.color
        }
      })
    );
  }

  getFrustums():
    Array<{
      frustum:
        Frustum;

      color:
        DebugColor;
    }> {
    return this.frustums.map(
      entry => ({
        frustum:
          entry.frustum,

        color: {
          ...entry.color
        }
      })
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Draw                                                                     */
  /* ------------------------------------------------------------------------ */

  render(
    renderer:
      DebugRenderer
  ):
    void {
    if (
      !this.enabled
    ) {
      return;
    }

    if (
      this.showLines
    ) {
      for (
        const line of
        this.lines
      ) {
        renderer.drawLine(
          line
        );
      }
    }

    if (
      this.showPoints
    ) {
      for (
        const point of
        this.points
      ) {
        renderer.drawPoint(
          point
        );
      }
    }

    if (
      this.showBounds
    ) {
      for (
        const box of
        this.boxes
      ) {
        renderer.drawBox(
          box
        );
      }

      for (
        const sphere of
        this.spheres
      ) {
        renderer.drawSphere(
          sphere
        );
      }
    }

    if (
      this.showFrustum
    ) {
      for (
        const entry of
        this.frustums
      ) {
        renderer.drawFrustum(
          entry.frustum,
          entry.color
        );
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Clear                                                                    */
  /* ------------------------------------------------------------------------ */

  clearGeometry():
    void {
    this.lines =
      [];

    this.points =
      [];

    this.boxes =
      [];

    this.spheres =
      [];

    this.frustums =
      [];
  }

  clear():
    void {
    this.clearGeometry();

    this.resetStats();
  }

  /* ------------------------------------------------------------------------ */
  /* Dispose                                                                  */
  /* ------------------------------------------------------------------------ */

  dispose():
    void {
    if (
      this.disposed
    ) {
      return;
    }

    this.clear();

    this.disposed =
      true;
  }

  private assertActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "RenderingDebug has been disposed."
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Debug Colors                                                               */
/* -------------------------------------------------------------------------- */

export const DEBUG_COLORS = {
  white: {
    r: 1,
    g: 1,
    b: 1,
    a: 1
  },

  red: {
    r: 1,
    g: 0,
    b: 0,
    a: 1
  },

  green: {
    r: 0,
    g: 1,
    b: 0,
    a: 1
  },

  blue: {
    r: 0,
    g: 0,
    b: 1,
    a: 1
  },

  yellow: {
    r: 1,
    g: 1,
    b: 0,
    a: 1
  },

  cyan: {
    r: 0,
    g: 1,
    b: 1,
    a: 1
  },

  magenta: {
    r: 1,
    g: 0,
    b: 1,
    a: 1
  }
} as const;

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRenderingDebug(
  options:
    DebugOptions = {}
):
  RenderingDebug {
  return new RenderingDebug(
    options
  );
}

export default RenderingDebug;
