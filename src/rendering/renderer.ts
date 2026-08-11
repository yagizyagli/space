/**
 * Space
 * Renderer
 *
 * Framework-agnostic rendering abstraction.
 *
 * Responsibilities:
 * - Renderer lifecycle
 * - Render loop
 * - Resize handling
 * - Pixel ratio
 * - Scene rendering
 * - Camera rendering
 * - Frame timing
 * - Render statistics
 * - Basic renderer configuration
 *
 * The renderer does NOT own:
 * - Astronomy calculations
 * - Camera logic
 * - Entity logic
 * - Application UI
 *
 * Those systems are composed externally.
 */

import type {
  RendererAdapter,
  RendererCapabilities,
  RendererOptions,
  RenderFrame,
  RenderStats,
  RenderTarget,
  RendererSize
} from "../types/rendering";

import type {
  SpaceScene
} from "../scene/space-scene";

import type {
  Camera
} from "../camera/camera";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RendererState =
  | "idle"
  | "running"
  | "paused"
  | "disposed";

export interface RendererEvents {
  frame: (frame: RenderFrame) => void;

  resize: (size: RendererSize) => void;

  start: () => void;

  stop: () => void;

  dispose: () => void;

  error: (error: Error) => void;
}

export interface RenderLoopOptions {
  autoStart?: boolean;

  maxDeltaTime?: number;

  targetFPS?: number;
}

export interface RendererContext {
  adapter: RendererAdapter;

  capabilities:
    RendererCapabilities;

  canvas:
    HTMLCanvasElement;

  size:
    RendererSize;

  state:
    RendererState;
}

/* -------------------------------------------------------------------------- */
/* Renderer                                                                   */
/* -------------------------------------------------------------------------- */

export class Renderer {
  private readonly adapter:
    RendererAdapter;

  private readonly canvas:
    HTMLCanvasElement;

  private state:
    RendererState = "idle";

  private scene:
    SpaceScene | null = null;

  private camera:
    Camera | null = null;

  private renderTarget:
    RenderTarget | null = null;

  private animationFrame:
    number | null = null;

  private lastFrameTime:
    number | null = null;

  private frameCount = 0;

  private elapsedTime = 0;

  private fps = 0;

  private deltaTime = 0;

  private width = 0;

  private height = 0;

  private pixelRatio = 1;

  private readonly maxDeltaTime:
    number;

  private readonly targetFPS:
    number | null;

  private readonly listeners:
    Map<
      keyof RendererEvents,
      Set<Function>
    > = new Map();

  constructor(
    options: RendererOptions
  ) {
    this.adapter =
      options.adapter;

    this.canvas =
      options.canvas;

    this.maxDeltaTime =
      options.maxDeltaTime ??
      0.1;

    this.targetFPS =
      options.targetFPS ??
      null;

    this.pixelRatio =
      options.pixelRatio ??
      this.getDevicePixelRatio();

    this.initialize(
      options
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Initialization                                                           */
  /* ------------------------------------------------------------------------ */

  private initialize(
    options: RendererOptions
  ): void {
    this.resize(
      options.width ??
        this.canvas.clientWidth,

      options.height ??
        this.canvas.clientHeight
    );

    this.adapter.initialize({
      canvas:
        this.canvas,

      width:
        this.width,

      height:
        this.height,

      pixelRatio:
        this.pixelRatio
    });

    if (
      options.autoStart
    ) {
      this.start();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  start(): void {
    if (
      this.state ===
      "disposed"
    ) {
      throw new Error(
        "Cannot start a disposed renderer."
      );
    }

    if (
      this.state ===
      "running"
    ) {
      return;
    }

    this.state =
      "running";

    this.lastFrameTime =
      performance.now();

    this.emit(
      "start"
    );

    this.scheduleFrame();
  }

  stop(): void {
    if (
      this.state !==
      "running"
    ) {
      return;
    }

    this.state =
      "paused";

    if (
      this.animationFrame !==
      null
    ) {
      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame =
        null;
    }

    this.emit(
      "stop"
    );
  }

  resume(): void {
    if (
      this.state ===
      "disposed"
    ) {
      throw new Error(
        "Cannot resume a disposed renderer."
      );
    }

    if (
      this.state ===
      "running"
    ) {
      return;
    }

    this.state =
      "running";

    this.lastFrameTime =
      performance.now();

    this.scheduleFrame();
  }

  dispose(): void {
    if (
      this.state ===
      "disposed"
    ) {
      return;
    }

    if (
      this.animationFrame !==
      null
    ) {
      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame =
        null;
    }

    this.adapter.dispose();

    this.scene = null;

    this.camera = null;

    this.renderTarget = null;

    this.state =
      "disposed";

    this.emit(
      "dispose"
    );

    this.listeners.clear();
  }

  /* ------------------------------------------------------------------------ */
  /* Frame loop                                                               */
  /* ------------------------------------------------------------------------ */

  private scheduleFrame(): void {
    if (
      this.state !==
      "running"
    ) {
      return;
    }

    this.animationFrame =
      requestAnimationFrame(
        (time) => {
          this.renderFrame(
            time
          );
        }
      );
  }

  private renderFrame(
    timestamp: number
  ): void {
    if (
      this.state !==
      "running"
    ) {
      return;
    }

    const previous =
      this.lastFrameTime ??
      timestamp;

    let delta =
      (
        timestamp -
        previous
      ) / 1000;

    delta =
      Math.min(
        delta,
        this.maxDeltaTime
      );

    if (
      this.targetFPS
    ) {
      const minimumDelta =
        1 /
        this.targetFPS;

      if (
        delta <
        minimumDelta
      ) {
        this.scheduleFrame();
        return;
      }
    }

    this.lastFrameTime =
      timestamp;

    this.deltaTime =
      delta;

    this.elapsedTime +=
      delta;

    this.frameCount++;

    this.updateFPS(
      delta
    );

    const frame: RenderFrame = {
      timestamp,

      deltaTime:
        delta,

      elapsedTime:
        this.elapsedTime,

      frame:
        this.frameCount,

      fps:
        this.fps
    };

    try {
      this.render(
        frame
      );

      this.emit(
        "frame",
        frame
      );
    } catch (
      error
    ) {
      this.emit(
        "error",
        error instanceof Error
          ? error
          : new Error(
              String(error)
            )
      );
    }

    this.scheduleFrame();
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  render(
    frame?: RenderFrame
  ): void {
    if (
      this.state ===
      "disposed"
    ) {
      return;
    }

    if (
      !this.scene ||
      !this.camera
    ) {
      return;
    }

    const renderFrame =
      frame ?? {
        timestamp:
          performance.now(),

        deltaTime:
          0,

        elapsedTime:
          this.elapsedTime,

        frame:
          this.frameCount,

        fps:
          this.fps
      };

    this.adapter.beginFrame(
      renderFrame
    );

    this.adapter.renderScene(
      this.scene,
      this.camera,
      this.renderTarget
    );

    this.adapter.endFrame(
      renderFrame
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Scene                                                                    */
  /* ------------------------------------------------------------------------ */

  setScene(
    scene: SpaceScene
  ): void {
    this.scene =
      scene;
  }

  getScene():
    SpaceScene | null {
    return this.scene;
  }

  clearScene(): void {
    this.scene =
      null;
  }

  /* ------------------------------------------------------------------------ */
  /* Camera                                                                   */
  /* ------------------------------------------------------------------------ */

  setCamera(
    camera: Camera
  ): void {
    this.camera =
      camera;
  }

  getCamera():
    Camera | null {
    return this.camera;
  }

  clearCamera(): void {
    this.camera =
      null;
  }

  /* ------------------------------------------------------------------------ */
  /* Render target                                                            */
  /* ------------------------------------------------------------------------ */

  setRenderTarget(
    target: RenderTarget | null
  ): void {
    this.renderTarget =
      target;
  }

  getRenderTarget():
    RenderTarget | null {
    return this.renderTarget;
  }

  /* ------------------------------------------------------------------------ */
  /* Resize                                                                   */
  /* ------------------------------------------------------------------------ */

  resize(
    width: number,
    height: number
  ): void {
    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    this.width =
      Math.floor(width);

    this.height =
      Math.floor(height);

    this.canvas.width =
      Math.floor(
        this.width *
        this.pixelRatio
      );

    this.canvas.height =
      Math.floor(
        this.height *
        this.pixelRatio
      );

    this.canvas.style.width =
      `${this.width}px`;

    this.canvas.style.height =
      `${this.height}px`;

    this.adapter.resize(
      this.width,
      this.height,
      this.pixelRatio
    );

    this.emit(
      "resize",
      this.getSize()
    );
  }

  setPixelRatio(
    ratio: number
  ): void {
    if (
      !Number.isFinite(ratio) ||
      ratio <= 0
    ) {
      return;
    }

    this.pixelRatio =
      ratio;

    this.resize(
      this.width,
      this.height
    );
  }

  getPixelRatio(): number {
    return this.pixelRatio;
  }

  getSize():
    RendererSize {
    return {
      width:
        this.width,

      height:
        this.height,

      pixelRatio:
        this.pixelRatio,

      bufferWidth:
        this.canvas.width,

      bufferHeight:
        this.canvas.height
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Clear                                                                     */
  /* ------------------------------------------------------------------------ */

  clear(): void {
    this.adapter.clear();
  }

  /* ------------------------------------------------------------------------ */
  /* Device                                                                    */
  /* ------------------------------------------------------------------------ */

  private getDevicePixelRatio(): number {
    if (
      typeof window ===
      "undefined"
    ) {
      return 1;
    }

    return Math.min(
      window.devicePixelRatio ||
        1,

      2
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  private updateFPS(
    delta: number
  ): void {
    if (
      delta <= 0
    ) {
      return;
    }

    const instantaneous =
      1 / delta;

    this.fps =
      this.fps === 0
        ? instantaneous
        : this.fps * 0.9 +
          instantaneous * 0.1;
  }

  getStats():
    RenderStats {
    return {
      fps:
        this.fps,

      frameCount:
        this.frameCount,

      elapsedTime:
        this.elapsedTime,

      deltaTime:
        this.deltaTime,

      drawCalls:
        this.adapter.getDrawCalls(),

      triangles:
        this.adapter.getTriangleCount(),

      memory:
        this.adapter.getMemoryUsage()
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Context                                                                  */
  /* ------------------------------------------------------------------------ */

  getContext():
    RendererContext {
    return {
      adapter:
        this.adapter,

      capabilities:
        this.adapter.getCapabilities(),

      canvas:
        this.canvas,

      size:
        this.getSize(),

      state:
        this.state
    };
  }

  getState():
    RendererState {
    return this.state;
  }

  /* ------------------------------------------------------------------------ */
  /* Events                                                                   */
  /* ------------------------------------------------------------------------ */

  on<K extends keyof RendererEvents>(
    event: K,
    listener: RendererEvents[K]
  ): () => void {
    let listeners =
      this.listeners.get(
        event
      );

    if (!listeners) {
      listeners =
        new Set();

      this.listeners.set(
        event,
        listeners
      );
    }

    listeners.add(
      listener
    );

    return () => {
      listeners?.delete(
        listener
      );
    };
  }

  off<K extends keyof RendererEvents>(
    event: K,
    listener: RendererEvents[K]
  ): void {
    this.listeners
      .get(event)
      ?.delete(listener);
  }

  private emit<
    K extends keyof RendererEvents
  >(
    event: K,
    ...args: Parameters<
      RendererEvents[K]
    >
  ): void {
    const listeners =
      this.listeners.get(
        event
      );

    if (!listeners) {
      return;
    }

    for (
      const listener of listeners
    ) {
      (
        listener as (
          ...args: Parameters<
            RendererEvents[K]
          >
        ) => void
      )(...args);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRenderer(
  options: RendererOptions
): Renderer {
  return new Renderer(
    options
  );
}

export default Renderer;
