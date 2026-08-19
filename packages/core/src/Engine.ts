import { LogarithmicCamera, StarField } from '../../render/src/Camera.ts'; // Safe straight dynamic imports
import { StarField as BackgroundStarField } from '../../render/src/StarField.ts';
import { KeplerianSolver } from '../../physics/src/solvers/keplerian.ts';
import { solarSystemBodies, subatomicParticles, deepSpaceEntities } from '../../database/src/index.ts';

export interface SpaceEngineConfig {
  canvasElement: HTMLCanvasElement;
  enableLiveTelemetry: boolean;
}

export class SpaceEngine {
  private isRunning: boolean = false;
  private camera: LogarithmicCamera;
  private starField: BackgroundStarField;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(config: SpaceEngineConfig) {
    this.canvas = config.canvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.camera = new LogarithmicCamera(7); 
    this.starField = new BackgroundStarField(this.canvas, 500);
    
    console.log('🚀 [Space Engine] Universal context mapping stabilized.');
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
    if (!this.isRunning) return;

    // 1. Draw stars backdrop frame
    this.starField.render(0.5);

    // 2. Compile every dynamic object list securely
    const allEntities = [
      ...subatomicParticles,
      ...solarSystemBodies,
      ...deepSpaceEntities
    ];

    for (const body of allEntities) {
      let screenX = this.canvas.width / 2;
      let screenY = this.canvas.height / 2;

      if ('orbitalElements' in body && body.orbitalElements) {
        const position = KeplerianSolver.computeOrbitalPosition(body as any, elapsedTimeInSeconds);
        screenX += (position.x / 1.496e11) * 250;
        screenY += (position.y / 1.496e11) * 250;
      }

      const pixelSize = this.camera.calculatePixelSize(body.radiusInMeters, body.scaleExponent, this.canvas.width);
      const finalRenderSize = Math.max(12, pixelSize);

      // Render actual body nodes on screen layer
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, finalRenderSize, 0, Math.PI * 2);
      this.ctx.fillStyle = body.visuals?.baseColor || '#50b6ff';
      this.ctx.fill();

      // Atmospheric aura logic
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, finalRenderSize * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(80, 182, 255, 0.12)';
      this.ctx.fill();

      // Print indicator descriptions cleanly
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px monospace';
      this.ctx.fillText(body.name, screenX + finalRenderSize + 10, screenY + 5);
    }

    this.camera.update();
    requestAnimationFrame(() => this.loop(elapsedTimeInSeconds + 8000));
  }
}
