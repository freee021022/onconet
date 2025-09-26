// Geocoding utilities for address to coordinates conversion
export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export class GeocodingService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address
        };
      } else {
        console.warn(`Geocoding failed for address: ${address}. Status: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Batch geocode multiple addresses
  async geocodeAddresses(addresses: string[]): Promise<(GeocodeResult | null)[]> {
    const results = await Promise.all(
      addresses.map(address => this.geocodeAddress(address))
    );
    return results;
  }

  // Reverse geocoding: coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn(`Reverse geocoding failed for coordinates: ${lat}, ${lng}`);
        return null;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const geocodingService = new GeocodingService(
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
);