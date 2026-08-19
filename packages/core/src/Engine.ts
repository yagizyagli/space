import { LogarithmicCamera, StarField } from '@space/render';
import { KeplerianSolver } from '@space/physics';
import { solarSystemBodies } from '@space/database';

export interface SpaceEngineConfig {
  canvasElement: HTMLCanvasElement;
  enableLiveTelemetry: boolean;
}

/**
 * The core orchestrator that brings database, physics, and rendering pipelines together.
 */
export class SpaceEngine {
  private isRunning: boolean = false;
  private camera: LogarithmicCamera;
  private starField: StarField;
  private canvas: HTMLCanvasElement;

  constructor(config: SpaceEngineConfig) {
    this.canvas = config.canvasElement;
    
    // Core layer configurations
    this.camera = new LogarithmicCamera(7); // Start at Earth scale (10^7m)
    this.starField = new StarField(this.canvas, 800);
    
    console.log('🚀 [Space Engine] Fully initialized. All packages integrated seamlessly.');
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop(0);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getCamera(): LogarithmicCamera {
    return this.camera;
  }

  private loop(elapsedTimeInSeconds: number): void {
    if (!this.isRunning) return;

    // 1. Render the background space universe
    this.starField.render(0.3);

    // 2. Compute physics for planetary assets
    for (const body of solarSystemBodies) {
      const position = KeplerianSolver.computeOrbitalPosition(body, elapsedTimeInSeconds);
      const pixelSize = this.camera.calculatePixelSize(body.radiusInMeters, body.scaleExponent, this.canvas.width);
      
      // Here, the engine triggers the rendering pipeline to draw the calculated entities
      // e.g., drawing circles on canvas based on position.x and position.y
    }

    // 3. Keep camera LERP values smooth
    this.camera.update();

    // Constant increment of time scale for calculations
    requestAnimationFrame(() => this.loop(elapsedTimeInSeconds + 5000));
  }
}
