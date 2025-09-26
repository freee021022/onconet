import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Star, Loader } from 'lucide-react';
import { Pharmacy } from '@shared/schema';
import PharmacyDetails from './PharmacyDetails';

interface GeolocationMapProps {
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const GeolocationMap = ({ onPharmacySelect }: GeolocationMapProps) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.9028, lng: 12.4964 }); // Default to Rome
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: googleMapsConfig } = useQuery({
    queryKey: ['/api/config/google-maps'],
    queryFn: async () => {
      const response = await fetch('/api/config/google-maps');
      return response.json();
    }
  });

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
        setMapCenter(location);
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
        maximumAge: 300000 // 5 minutes
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

  const getNearbyPharmacies = () => {
    if (!pharmacies || !userLocation) return pharmacies || [];
    
    return pharmacies
      .map(pharmacy => ({
        ...pharmacy,
        distance: pharmacy.latitude && pharmacy.longitude 
          ? calculateDistance(userLocation.lat, userLocation.lng, pharmacy.latitude, pharmacy.longitude)
          : null
      }))
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
      .slice(0, 10); // Show top 10 nearest
  };

  const nearbyPharmacies = getNearbyPharmacies();

  useEffect(() => {
    // Try to get user location on component mount
    getUserLocation();
  }, []);

  if (!googleMapsConfig?.apiKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Configurazione Google Maps non disponibile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Trova Farmacie Vicine
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
              {isGettingLocation ? 'Rilevamento...' : 'Trova la mia posizione'}
            </Button>
            
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <MapPin className="h-4 w-4" />
                <span>Posizione rilevata</span>
              </div>
            )}
          </div>
          
          {locationError && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">{locationError}</p>
              <p className="text-orange-600 text-xs mt-1">
                Puoi comunque esplorare la mappa per trovare farmacie nella tua zona.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '400px', width: '100%' }}>
            <LoadScript googleMapsApiKey={googleMapsConfig.apiKey}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={userLocation ? 13 : 10}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="24" height="24">
                          <circle cx="12" cy="12" r="8" fill="blue" stroke="white" stroke-width="2"/>
                          <circle cx="12" cy="12" r="3" fill="white"/>
                        </svg>
                      `),
                      scaledSize: new window.google.maps.Size(24, 24)
                    }}
                    title="La tua posizione"
                  />
                )}

                {/* Pharmacy markers */}
                {nearbyPharmacies.map((pharmacy) => (
                  pharmacy.latitude && pharmacy.longitude && (
                    <Marker
                      key={pharmacy.id}
                      position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      icon={{
                        url: 'data:image/svg+xml;base64,' + btoa(`
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="30" height="30">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            <text x="12" y="9" text-anchor="middle" fill="white" font-size="8" font-weight="bold">+</text>
                          </svg>
                        `),
                        scaledSize: new window.google.maps.Size(30, 30)
                      }}
                      title={pharmacy.name}
                    />
                  )
                ))}

                {/* Info window for selected pharmacy */}
                {selectedPharmacy && selectedPharmacy.latitude && selectedPharmacy.longitude && (
                  <InfoWindow
                    position={{ lat: selectedPharmacy.latitude, lng: selectedPharmacy.longitude }}
                    onCloseClick={() => setSelectedPharmacy(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-bold text-sm mb-1">{selectedPharmacy.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {selectedPharmacy.address}, {selectedPharmacy.city}
                      </p>
                      {selectedPharmacy.distance && (
                        <Badge variant="outline" className="text-xs mb-2">
                          {selectedPharmacy.distance.toFixed(1)} km
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            const address = encodeURIComponent(`${selectedPharmacy.address}, ${selectedPharmacy.city}`);
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                          }}
                        >
                          Navigazione
                        </Button>
                        {onPharmacySelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                            onClick={() => onPharmacySelect(selectedPharmacy)}
                          >
                            Dettagli
                          </Button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </CardContent>
      </Card>

      {/* Nearby pharmacies list */}
      {userLocation && nearbyPharmacies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Farmacie più vicine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPharmacies.slice(0, 5).map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPharmacy(pharmacy)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{pharmacy.name}</h4>
                    <p className="text-sm text-gray-600">
                      {pharmacy.address}, {pharmacy.city}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {pharmacy.distance && (
                        <Badge variant="outline" className="text-xs">
                          {pharmacy.distance.toFixed(1)} km
                        </Badge>
                      )}
                      {pharmacy.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{pharmacy.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {pharmacy.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${pharmacy.phone}`, '_self');
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const address = encodeURIComponent(`${pharmacy.address}, ${pharmacy.city}`);
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pharmacy details modal */}
      {selectedPharmacy && onPharmacySelect && (
        <PharmacyDetails
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </div>
  );
};

export default GeolocationMap;