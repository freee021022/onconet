import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Pharmacy } from '@shared/schema';

interface SimpleMapComponentProps {
  pharmacies: Pharmacy[];
}

const SimpleMapComponent = ({ pharmacies }: SimpleMapComponentProps) => {
  const { t } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  
  // For now, show a static map with pharmacy list until Google Maps is fully configured
  return (
    <div className="w-full h-full bg-neutral-100 relative">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80"
            alt="Mappa Italia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Map overlay with pharmacy info */}
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md max-w-sm">
            <h3 className="font-bold text-lg mb-2">{t('pharmacy.mapTitle')}</h3>
            <p className="text-sm text-neutral-600 mb-3">
              {pharmacies.length} {t('pharmacy.pharmaciesFound')}
            </p>
            
            {/* Interactive pharmacy markers simulation */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pharmacies.slice(0, 5).map((pharmacy, index) => (
                <div 
                  key={pharmacy.id}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded cursor-pointer transition-colors"
                  onClick={() => setSelectedPharmacy(pharmacy)}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium">{pharmacy.name}</p>
                      <p className="text-xs text-neutral-500">{pharmacy.city}</p>
                    </div>
                  </div>
                  <div className="text-xs text-primary">
                    {pharmacy.rating && `★ ${pharmacy.rating.toFixed(1)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Maps integration notice */}
          <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md text-xs">
            <p className="font-medium mb-1">🗺️ Mappa Interattiva</p>
            <p className="text-neutral-600">
              La mappa completa con Google Maps è in caricamento...
            </p>
          </div>
        </div>
      </div>

      {/* Selected pharmacy details */}
      {selectedPharmacy && (
        <div className="absolute inset-x-4 bottom-4 bg-white p-4 rounded-lg shadow-lg border">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg">{selectedPharmacy.name}</h4>
            <button 
              onClick={() => setSelectedPharmacy(null)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-neutral-600 mb-2">{selectedPharmacy.address}</p>
          <p className="text-sm text-neutral-600 mb-2">{selectedPharmacy.city}, {selectedPharmacy.region}</p>
          {selectedPharmacy.phone && (
            <p className="text-sm mb-2">
              📞 <a href={`tel:${selectedPharmacy.phone}`} className="text-primary hover:underline">
                {selectedPharmacy.phone}
              </a>
            </p>
          )}
          {selectedPharmacy.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm ml-1">{selectedPharmacy.rating.toFixed(1)}/5</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleMapComponent;