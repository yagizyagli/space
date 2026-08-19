interface Star {
  x: number;
  y: number;
  z: number;
  brightness: number;
}

/**
 * High-performance 2D/3D Starfield generator using canvas-level block rendering.
 * Operates efficiently at 60+ FPS with zero third-party dependencies.
 */
export class StarField {
  private stars: Star[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement, maxStars: number = 1000) {
    this.ctx = canvas.getContext('2d')!;
    this.initializeStars(maxStars);
  }

  private initializeStars(count: number): void {
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * this.canvas.width * 2,
        y: (Math.random() - 0.5) * this.canvas.height * 2,
        z: Math.random() * this.canvas.width,
        brightness: Math.random()
      });
    }
  }

  /**
   * Renders and updates star vectors based on the warp speed or camera zoom velocity.
   * @param speed Speed modifier for star movement effect
   */
  public render(speed: number = 0.5): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const star of this.stars) {
      star.z -= speed;
      if (star.z <= 0) {
        star.z = this.canvas.width;
      }

      // Project 3D coordinates onto 2D screen surface
      const k = 128.0 / star.z;
      const px = star.x * k + this.canvas.width / 2;
      const py = star.y * k + this.canvas.height / 2;

      if (px >= 0 && px <= this.canvas.width && py >= 0 && py <= this.canvas.height) {
        const size = (1 - star.z / this.canvas.width) * 2;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        this.ctx.fillRect(px, py, size, size);
      }
    }
  }
}
