import { Pharmacy } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, ExternalLink } from 'lucide-react';

interface PharmacyDetailsProps {
  pharmacy: Pharmacy;
  onClose: () => void;
}

const PharmacyDetails = ({ pharmacy, onClose }: PharmacyDetailsProps) => {
  const handleAddressClick = () => {
    const address = encodeURIComponent(`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.region}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handlePhoneClick = () => {
    if (pharmacy.phone) {
      window.open(`tel:${pharmacy.phone}`, '_self');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{pharmacy.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-3">
        {/* Address - Clickable to open Google Maps with directions */}
        <div 
          className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={handleAddressClick}
          title="Clicca per aprire in Google Maps e tracciare il percorso"
        >
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
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

        {/* Phone - Clickable to call */}
        {pharmacy.phone && (
          <div 
            className="flex items-center gap-2 p-3 rounded-lg bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={handlePhoneClick}
            title="Clicca per chiamare"
          >
            <Phone className="h-5 w-5 text-green-600" />
            <span className="text-green-900 font-medium">{pharmacy.phone}</span>
          </div>
        )}

        {/* Rating */}
        {pharmacy.rating && (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <span className="font-medium">{pharmacy.rating}</span>
            <span className="text-gray-500 text-sm">
              ({pharmacy.reviewCount || 0} recensioni)
            </span>
          </div>
        )}

        {/* Specializations */}
        {pharmacy.specializations && pharmacy.specializations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Specializzazioni:</h4>
            <div className="flex flex-wrap gap-1">
              {pharmacy.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            onClick={handleAddressClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Navigazione
          </Button>
          
          {pharmacy.phone && (
            <Button
              onClick={handlePhoneClick}
              variant="outline"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              Chiama
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;