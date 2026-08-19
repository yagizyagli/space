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
    this.camera = new LogarithmicCamera(7); // Default Planetary Scale
    this.starField = new StarField(this.canvas, 500);
    
    console.log('🚀 [Space Engine] Engine initialized cleanly. Render loop warm.');
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
    // FIXED: Removed the invalid syntax placeholder string token
    if (!this.isRunning) return;

    // 1. Draw stars backdrop configuration frame
    this.starField.render(0.5);

    // 2. Compile every scale profile entity from database packages
    const allEntities = [
      ...subatomicParticles,
      ...solarSystemBodies,
      ...deepSpaceEntities
    ];

    for (const body of allEntities) {
      let screenX = this.canvas.width / 2;
      let screenY = this.canvas.height / 2;

      // Handle translation mechanics for active orbiting bodies
      if ('orbitalElements' in body && body.orbitalElements) {
        const position = KeplerianSolver.computeOrbitalPosition(body as any, elapsedTimeInSeconds);
        // Scaled offset projection vectors mapped for explicit screen visibility
        screenX += (position.x / 1.496e11) * 250;
        screenY += (position.y / 1.496e11) * 250;
      }

      // Compute visual boundary sizes matching current logarithmic zoom states
      const pixelSize = this.camera.calculatePixelSize(body.radiusInMeters, body.scaleExponent, this.canvas.width);

      // Clamping limits so nodes are explicitly rendered as pointer units on viewport matrix
      const finalRenderSize = Math.max(12, pixelSize);

      // Execute vector paths draw cycles natively
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, finalRenderSize, 0, Math.PI * 2);
      this.ctx.fillStyle = body.visuals?.baseColor || '#50b6ff';
      this.ctx.fill();

      // Atmospheric secondary aura rendering logic
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, finalRenderSize * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(80, 182, 255, 0.15)';
      this.ctx.fill();

      // Print item entity indicators
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px monospace';
      this.ctx.fillText(body.name, screenX + finalRenderSize + 10, screenY + 5);
    }

    // 3. Increment scaling engine constraints dynamically
    this.camera.update();
    
    requestAnimationFrame(() => this.loop(elapsedTimeInSeconds + 8000));
  }
}
