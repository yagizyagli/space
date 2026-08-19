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

    this.starField.render(0.5);

    // Group all universal entries together for consolidated rendering pipeline
    const allEntities = [
      ...subatomicParticles,
      ...solarSystemBodies,
      ...deepSpaceEntities
    ];

    for (const body of allEntities) {
      // If the body has orbital elements, compute movement, else render static coordinates
      let screenX = this.canvas.width / 2;
      let screenY = this.canvas.height / 2;

      if ('orbitalElements' in body && body.orbitalElements) {
        const position = KeplerianSolver.computeOrbitalPosition(body as any, elapsedTimeInSeconds);
        screenX += (position.x / 1.496e11) * 200;
        screenY += (position.y / 1.496e11) * 200;
      }

      const pixelSize = this.camera.calculatePixelSize(body.radiusInMeters, body.scaleExponent, this.canvas.width);

      // Simple filter: Only draw if the entity is visible at current zoom ranges
      if (pixelSize > 0.5) {
        this.ctx. someColor = 'stellarClass' in body ? '#ff3366' : '#50b6ff';
        
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, pixelSize, 0, Math.PI * 2);
        this.ctx.fillStyle = body.visuals?.baseColor || this.ctx.someColor;
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(body.name, screenX + pixelSize + 5, screenY + 4);
      }
    }

    this.camera.update();
    requestAnimationFrame(() => this.loop(elapsedTimeInSeconds + 5000));
  }
}
