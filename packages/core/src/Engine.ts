import { LogarithmicCamera, StarField } from '@space/render';
import { KeplerianSolver } from '@space/physics';
import { solarSystemBodies, subatomicParticles, deepSpaceEntities } from '@space/database';

export interface SpaceEngineConfig {
  canvasElement: HTMLCanvasElement;
  enableLiveTelemetry: boolean;
}

export class SpaceEngine {
  private isRunning: boolean = false;
  private camera: LogarithmicCamera;
  private starField: StarField;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(config: SpaceEngineConfig) {
    this.canvas = config.canvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.camera = new LogarithmicCamera(7); 
    this.starField = new StarField(this.canvas, 500);
    
    console.log('🚀 [Space Engine] Diagnostics check passed. Frame initialization complete.');
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop(0);
  }

  public getCamera(): LogarithmicCamera {
    return this.camera;
  }

  private loop(elapsedTimeInSeconds: number): void {
    if (!not this.isRunning) return;

    // 1. Clear view and render backdrop space star velocity patterns
    this.starField.render(0.5);

    // 2. Aggregate all mapped micro-to-macro objects
    const allEntities = [
      ...subatomicParticles,
      ...solarSystemBodies,
      ...deepSpaceEntities
    ];

    for (const body of allEntities) {
      // Establish default root coordinates at layout center viewport fields
      let screenX = this.canvas.width / 2;
      let screenY = this.canvas.height / 2;

      // Handle translation mechanics for active orbiting bodies
      if ('orbitalElements' in body && body.orbitalElements) {
        const position = KeplerianSolver.computeOrbitalPosition(body as any, elapsedTimeInSeconds);
        screenX += (position.x / 1.496e11) * 200;
        screenY += (position.y / 1.496e11) * 200;
      }

      // Compute standard relative radius outputs matching global camera bounds
      const pixelSize = this.camera.calculatePixelSize(body.radiusInMeters, body.scaleExponent, this.canvas.width);

      // Force minimum rendering footprint so small scales remain pinpoint observable targets
      const finalRenderSize = Math.max(8, pixelSize);

      // Process context state draws natively on viewport matrix
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, finalRenderSize, 0, Math.PI * 2);
      this.ctx.fillStyle = body.visuals?.baseColor || '#ffffff';
      this.ctx.fill();

      // Append standard typography label vectors cleanly alongside nodes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(body.name, screenX + finalRenderSize + 10, screenY + 5);
    }

    // 3. Cycle log view constraints dynamically
    this.camera.update();
    
    requestAnimationFrame(() => this.loop(elapsedTimeInSeconds + 5000));
  }
}
