// Server-side geocoding utility
export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
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
