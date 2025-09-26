import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Navigation, Clock, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Pharmacy } from '@shared/schema';

interface AdvancedPharmacyMapProps {
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
}

const AdvancedPharmacyMap = ({ onPharmacySelect }: AdvancedPharmacyMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const defaultCenter = {
    lat: 41.9028,
    lng: 12.4964 // Roma
  };

  // Fetch pharmacies
  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['/api/pharmacies'],
    queryFn: async () => {
      const response = await fetch('/api/pharmacies');
      if (!response.ok) throw new Error('Failed to fetch pharmacies');
      return response.json() as Promise<Pharmacy[]>;
    }
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(userPos);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Initialize directions service
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 4
      }
    });
    directionsRendererRef.current.setMap(map);
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter pharmacies based on criteria
  const filteredPharmacies = pharmacies.filter(pharmacy => {
    // Filter by specialization if selected
    if (selectedSpecialization && !pharmacy.specializations?.includes(selectedSpecialization)) {
      return false;
    }

    // Filter by radius if user location is available
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat(),
        userLocation.lng(),
        parseFloat(pharmacy.latitude),
        parseFloat(pharmacy.longitude)
      );
      if (distance > searchRadius) {
        return false;
      }
    }

    return true;
  });

  // Get directions to pharmacy
  const getDirections = (pharmacy: Pharmacy) => {
    if (!userLocation || !directionsServiceRef.current || !directionsRendererRef.current) {
      // Fallback to Google Maps web
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(mapsUrl, '_blank');
      return;
    }

    const destination = new google.maps.LatLng(
      parseFloat(pharmacy.latitude),
      parseFloat(pharmacy.longitude)
    );

    directionsServiceRef.current.route({
      origin: userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK' && result && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }
    });
  };

  // Clear directions
  const clearDirections = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
    }
  };

  // Get current time status for pharmacy
  const getOpenStatus = (pharmacy: Pharmacy) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Mock opening hours - in real app this would come from pharmacy data
    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isOpen = isWeekday ? 
      (currentHour >= 8 && currentHour < 20) : 
      (currentHour >= 9 && currentHour < 18);

    return {
      isOpen,
      nextChange: isOpen ? 
        (isWeekday ? '20:00' : '18:00') : 
        (isWeekday ? '08:00' : '09:00')
    };
  };

  // Unique specializations for filter
  const availableSpecializations = Array.from(
    new Set(pharmacies.flatMap(p => p.specializations || []))
  ).filter(Boolean);

  const clusterStyles = [
    {
      textColor: 'white',
      url: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#2563eb"/>
          <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">CLUSTER_SIZE</text>
        </svg>
      `),
      height: 40,
      width: 40
    }
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Ricerca Farmacie Avanzata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="radius">Raggio di ricerca (km)</Label>
              <Input
                id="radius"
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value) || 10)}
                min="1"
                max="50"
              />
            </div>
            
            <div>
              <Label htmlFor="specialization">Specializzazione</Label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tutte le specializzazioni</option>
                {availableSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={clearDirections}
                variant="outline"
                className="w-full"
              >
                Pulisci Indicazioni
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {filteredPharmacies.length} farmacie trovate
            </Badge>
            {userLocation && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                Posizione rilevata
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="relative">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation || defaultCenter}
            zoom={userLocation ? 12 : 6}
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true
            }}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285f4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }}
                title="La tua posizione"
              />
            )}

            {/* Pharmacy markers with clustering */}
            <MarkerClusterer
              options={{
                styles: clusterStyles,
                maxZoom: 15,
                gridSize: 60
              }}
            >
              {(clusterer) =>
                filteredPharmacies.map((pharmacy) => {
                  const openStatus = getOpenStatus(pharmacy);
                  
                  return (
                    <Marker
                      key={pharmacy.id}
                      clusterer={clusterer}
                      position={{
                        lat: parseFloat(pharmacy.latitude),
                        lng: parseFloat(pharmacy.longitude)
                      }}
                      icon={{
                        url: `data:image/svg+xml;base64,${btoa(`
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="16" fill="${openStatus.isOpen ? '#10b981' : '#ef4444'}" stroke="white" stroke-width="2"/>
                            <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">+</text>
                          </svg>
                        `)}`,
                        scaledSize: new google.maps.Size(32, 32)
                      }}
                      onClick={() => {
                        setSelectedPharmacy(pharmacy);
                        onPharmacySelect?.(pharmacy);
                      }}
                    />
                  );
                })
              }
            </MarkerClusterer>

            {/* Info Window */}
            {selectedPharmacy && (
              <InfoWindow
                position={{
                  lat: parseFloat(selectedPharmacy.latitude),
                  lng: parseFloat(selectedPharmacy.longitude)
                }}
                onCloseClick={() => setSelectedPharmacy(null)}
              >
                <div className="p-2 max-w-xs">
                  <div className="font-semibold text-lg mb-2">{selectedPharmacy.name}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span>{selectedPharmacy.address}</span>
                    </div>
                    
                    {selectedPharmacy.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{selectedPharmacy.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className={getOpenStatus(selectedPharmacy).isOpen ? 'text-green-600' : 'text-red-600'}>
                        {getOpenStatus(selectedPharmacy).isOpen ? 'Aperta' : 'Chiusa'}
                      </span>
                      <span className="text-gray-500">
                        • {getOpenStatus(selectedPharmacy).isOpen ? 'Chiude' : 'Apre'} alle {getOpenStatus(selectedPharmacy).nextChange}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{selectedPharmacy.rating?.toFixed(1) || 'N/A'}</span>
                    </div>

                    {selectedPharmacy.specializations && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedPharmacy.specializations.map(spec => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => getDirections(selectedPharmacy)}
                      className="flex items-center gap-1"
                    >
                      <Navigation className="h-3 w-3" />
                      Indicazioni
                    </Button>
                    
                    {selectedPharmacy.googleMapsLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedPharmacy.googleMapsLink!, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Maps
                      </Button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default AdvancedPharmacyMap;
