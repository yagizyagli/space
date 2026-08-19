interface INasaAsteroid {
  id: string;
  name: string;
  estimatedDiameterInMeters: number;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  missDistanceInKm: number;
}

/**
 * Real-time telemetry client to stream actual astrophysical data directly from NASA APIs.
 */
export class NasaJplClient {
  private static readonly BASE_URL = 'https://nasa.gov';
  
  /**
   * Fetches Near-Earth Objects (Asteroids) currently tracked by NASA for a specific date window.
   * 
   * @param startDate Format: YYYY-MM-DD
   * @param apiKey Default NASA Demo Key (Should be replaced by developers in production)
   * @returns {Promise<INasaAsteroid[]>} Clean parsed array of tracked asteroids
   */
  public static async fetchNearEarthAsteroids(startDate: string, apiKey: string = 'DEMO_KEY'): Promise<INasaAsteroid[]> {
    try {
      const response = await fetch(`${this.BASE_URL}?start_date=${startDate}&end_date=${startDate}&api_key=${apiKey}`);
      if (!response.ok) throw new Error(`NASA API Network error: ${response.statusText}`);
      
      const data = await response.json();
      const neoObjects = data.near_earth_objects[startDate] || [];

      return neoObjects.map((obj: any) => ({
        id: obj.id,
        name: obj.name,
        estimatedDiameterInMeters: (obj.estimated_diameter.meters.estimated_diameter_min + obj.estimated_diameter.meters.estimated_diameter_max) / 2,
        isPotentiallyHazardous: obj.is_potentially_hazardous_asteroid,
        closeApproachDate: obj.close_approach_data[0]?.close_approach_date || startDate,
        missDistanceInKm: parseFloat(obj.close_approach_data[0]?.miss_distance.kilometers || '0')
      }));
    } catch (error) {
      console.error('❌ Failed to stream telemetry data from NASA JPL:', error);
      return []; // Returns empty array to prevent application crashes
    }
  }
}
