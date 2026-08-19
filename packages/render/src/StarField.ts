interface Star {
  x: number;
  y: number;
  z: number;
  brightness: number;
}

export class StarField {
  private stars: Star[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement, maxStars: number = 500) {
    this.ctx = canvas.getContext('2d')!;
    this.initializeStars(maxStars);
  }

  private initializeStars(count: number): void {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        brightness: Math.random()
      });
    }
  }

  public render(speed: number = 0.5): void {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;

    // Reset backdrop canvas layer state fields securely
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);

    for (const star of this.stars) {
      star.z -= speed;
      if (star.z <= 0) {
        star.z = width;
      }

      const k = 128.0 / star.z;
      const px = star.x * k + width / 2;
      const py = star.y * k + height / 2;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = (1 - star.z / width) * 2;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        this.ctx.fillRect(px, py, size, size);
      }
    }
  }
}
