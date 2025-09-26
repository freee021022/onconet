import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Pharmacy } from '@shared/schema';
import GoogleMapReact from 'google-map-react';
import MapMarker from './MapMarker';
import PharmacyDetails from './PharmacyDetails';

interface MapComponentProps {
  pharmacies: Pharmacy[];
}

// Centro dell'Italia
const defaultCenter = {
  lat: 42.504154,
  lng: 12.646361
};

// Selezioniamo 4 stili di mappa che possono essere utili
const mapStyles = [
  { 
    id: 'standard', 
    name: 'Standard', 
    styles: []
  },
  { 
    id: 'silver', 
    name: 'Silver', 
    styles: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]
  }
];

const MapComponent = ({ pharmacies }: MapComponentProps) => {
  const { t } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(mapStyles[0]);
  const [showMap, setShowMap] = useState(false);

  // Check if Google Maps API key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Verifichiamo che le coordinate delle farmacie siano valide
  const validPharmacies = pharmacies.filter(pharmacy => {
    const lat = parseFloat(pharmacy.latitude || '0');
    const lng = parseFloat(pharmacy.longitude || '0');
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  // Funzioni per mostrare e nascondere i dettagli della farmacia
  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const handleDetailsClose = () => {
    setSelectedPharmacy(null);
  };

  // Configuriamo le opzioni della mappa
  const mapOptions = {
    styles: selectedStyle.styles,
    fullscreenControl: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    minZoom: 4,
    maxZoom: 18,
  };

  // Evento chiamato quando la mappa è stata caricata
  const handleMapLoaded = (map: any, maps: any) => {
    setMapIsLoaded(true);
    
    // Se ci sono farmacie, impostiamo i confini della mappa per mostrarle tutte
    if (validPharmacies.length > 0) {
      const bounds = new maps.LatLngBounds();
      
      validPharmacies.forEach(pharmacy => {
        const lat = parseFloat(pharmacy.latitude || '0');
        const lng = parseFloat(pharmacy.longitude || '0');
        
        bounds.extend({ lat, lng });
      });
      
      map.fitBounds(bounds);
      
      // Se c'è solo una farmacia, impostiamo uno zoom appropriato
      if (validPharmacies.length === 1) {
        map.setZoom(14);
      }
    }
  };

  if (!showMap) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="text-center p-4">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md mb-4"
            onClick={() => setShowMap(true)}
          >
            {t('pharmacy.loadMap')}
          </button>
          <p className="text-neutral-600">{t('pharmacy.loadMapDescription')}</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="text-center p-4">
          <span className="text-red-500 text-4xl mb-2">⚠️</span>
          <h3 className="text-lg font-bold mb-1">{t('pharmacy.apiKeyError')}</h3>
          <p className="text-neutral-600">Chiave API Google Maps non configurata</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* @ts-ignore - GoogleMapReact typing issue workaround */}
      <GoogleMapReact
        bootstrapURLKeys={{ 
          key: apiKey,
          language: 'it',
          region: 'it'
        }}
        defaultCenter={defaultCenter}
        defaultZoom={6}
        options={mapOptions}
        onGoogleApiLoaded={({ map, maps }) => handleMapLoaded(map, maps)}
        yesIWantToUseGoogleMapApiInternals
      >
        {validPharmacies.map(pharmacy => {
          const lat = parseFloat(pharmacy.latitude || '0');
          const lng = parseFloat(pharmacy.longitude || '0');
          
          if (!lat || !lng) return null;
          
          return (
            <MapMarker
              key={pharmacy.id}
              pharmacy={pharmacy}
              lat={lat}
              lng={lng}
              onClick={() => handleMarkerClick(pharmacy)}
            />
          );
        })}
      </GoogleMapReact>

      {/* Controlli della mappa */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-10">
        <select 
          className="text-sm border rounded p-1 focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedStyle.id}
          onChange={(e) => {
            const selected = mapStyles.find(style => style.id === e.target.value);
            if (selected) setSelectedStyle(selected);
          }}
        >
          {mapStyles.map(style => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
      </div>

      {/* Informazioni sulla mappa */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-xs z-10">
        <p className="font-bold">{t('pharmacy.mapDisclaimer')}</p>
        <p>{t('pharmacy.mapDisclaimerText')}</p>
        <div className="mt-2">
          <p>
            <strong>{t('pharmacy.pharmaciesFound')}:</strong> {validPharmacies.length}
          </p>
        </div>
      </div>

      {/* Dettagli della farmacia selezionata */}
      {selectedPharmacy && (
        <PharmacyDetails 
          pharmacy={selectedPharmacy} 
          onClose={handleDetailsClose} 
        />
      )}
    </div>
  );
};

export default MapComponent;
