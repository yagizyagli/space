/**
 * Advanced logarithmic camera to navigate from subatomic to cosmic scales
 * without encountering floating-point precision errors (Z-fighting / jittering).
 */
export class LogarithmicCamera {
  private currentExponent: number = 0; // Base 10 exponent (0 = 1 meter, 7 = Earth scale)
  private targetExponent: number = 0;
  private lerpFactor: number = 0.1; // Smooth transition coefficient

  constructor(initialExponent: number = 0) {
    this.currentExponent = initialExponent;
    this.targetExponent = initialExponent;
  }

  /**
   * Sets the absolute target zoom exponent level.
   * @param exponent Power of 10 (e.g., -15 for subatomic, 24 for observable universe)
   */
  public zoomTo(exponent: number): void {
    this.targetExponent = exponent;
  }

  /**
   * Smoothly updates the camera zoom position using Linear Interpolation (LERP).
   * Must be called inside the requestAnimationFrame loop.
   */
  public update(): void {
    this.currentExponent += (this.targetExponent - this.currentExponent) * this.lerpFactor;
  }

  /**
   * Computes the visual screen radius (pixels) for any given cosmic entity.
   * Prevents objects from becoming sub-pixel (invisible) or filling the whole screen.
   * 
   * @param realRadiusInMeters Actual physical radius of the object
   * @param objectExponent Power of 10 scale of the object
   * @param screenWidth Screen viewport width in pixels
   * @returns {number} Computed pixel size for rendering
   */
  public calculatePixelSize(realRadiusInMeters: number, objectExponent: number, screenWidth: number): number {
    const viewRangeMeters = Math.pow(10, this.currentExponent);
    const calculatedSize = (realRadiusInMeters / viewRangeMeters) * (screenWidth / 2);
    
    // Clamping to avoid extreme processing values
    return Math.max(0.1, Math.min(calculatedSize, screenWidth * 2));
  }

  public getCurrentScaleExponent(): number {
    return this.currentExponent;
  }
}
