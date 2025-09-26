import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Star, Loader, ExternalLink } from 'lucide-react';
import { Pharmacy } from '@shared/schema';

interface UserLocation {
  lat: number;
  lng: number;
}

const PharmacyFinder = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<(Pharmacy & { distance?: number })[]>([]);

  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['/api/pharmacies'],
    queryFn: async () => {
      const response = await fetch('/api/pharmacies');
      if (!response.ok) throw new Error('Failed to fetch pharmacies');
      return response.json() as Promise<Pharmacy[]>;
    }
  });

  const getUserLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('La geolocalizzazione non è supportata dal tuo browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Errore nella geolocalizzazione';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permesso di geolocalizzazione negato. Abilita la posizione per trovare le farmacie più vicine.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Posizione non disponibile.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout nella richiesta di posizione.';
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (userLocation && pharmacies) {
      const pharmaciesWithDistance = pharmacies
        .map(pharmacy => ({
          ...pharmacy,
          distance: pharmacy.latitude && pharmacy.longitude 
            ? calculateDistance(userLocation.lat, userLocation.lng, pharmacy.latitude, pharmacy.longitude)
            : null
        }))
        .filter(pharmacy => pharmacy.distance !== null)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 10) as (Pharmacy & { distance: number })[];
      
      setNearbyPharmacies(pharmaciesWithDistance);
    }
  }, [userLocation, pharmacies]);

  const handleAddressClick = (pharmacy: Pharmacy) => {
    const address = encodeURIComponent(`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.region}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trova Farmacie Vicino a Te
          </h1>
          <p className="text-gray-600">
            Usa la geolocalizzazione per trovare le farmacie più vicine alla tua posizione
          </p>
        </div>

        {/* Location Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Rileva la tua posizione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                onClick={getUserLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2"
              >
                {isGettingLocation ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isGettingLocation ? 'Rilevamento in corso...' : 'Trova la mia posizione'}
              </Button>
              
              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>Posizione rilevata con successo</span>
                </div>
              )}
            </div>
            
            {locationError && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">{locationError}</p>
                <p className="text-orange-600 text-xs mt-1">
                  Assicurati di aver dato il permesso di accesso alla posizione nel tuo browser.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Caricamento farmacie...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Pharmacies List */}
        {userLocation && nearbyPharmacies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Farmacie più vicine ({nearbyPharmacies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyPharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {pharmacy.name}
                        </h3>
                        
                        {/* Address - Clickable */}
                        <div 
                          className="flex items-start gap-2 mb-3 p-2 rounded bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleAddressClick(pharmacy)}
                          title="Clicca per aprire in Google Maps"
                        >
                          <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {pharmacy.address}
                            </p>
                            <p className="text-sm text-blue-700">
                              {pharmacy.city}, {pharmacy.region}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600">Traccia percorso</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-sm">
                            {pharmacy.distance?.toFixed(1)} km di distanza
                          </Badge>
                          
                          {pharmacy.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{pharmacy.rating}</span>
                            </div>
                          )}
                        </div>

                        {pharmacy.specializations && pharmacy.specializations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Specializzazioni:</p>
                            <div className="flex flex-wrap gap-1">
                              {pharmacy.specializations.map((spec, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => handleAddressClick(pharmacy)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Navigazione
                      </Button>
                      
                      {pharmacy.phone && (
                        <Button
                          onClick={() => handlePhoneClick(pharmacy.phone!)}
                          variant="outline"
                          size="sm"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Chiama
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Location or No Results */}
        {!userLocation && !isGettingLocation && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Rileva la tua posizione
              </h3>
              <p className="text-gray-600 mb-4">
                Clicca sul pulsante sopra per trovare le farmacie più vicine a te
              </p>
            </CardContent>
          </Card>
        )}

        {/* All Pharmacies Fallback */}
        {userLocation && nearbyPharmacies.length === 0 && pharmacies && (
          <Card>
            <CardHeader>
              <CardTitle>Tutte le farmacie disponibili</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {pharmacies.slice(0, 5).map((pharmacy) => (
                  <div key={pharmacy.id} className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2">{pharmacy.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {pharmacy.address}, {pharmacy.city}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddressClick(pharmacy)}
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Navigazione
                      </Button>
                      {pharmacy.phone && (
                        <Button
                          onClick={() => handlePhoneClick(pharmacy.phone!)}
                          variant="outline"
                          size="sm"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Chiama
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacyFinder;