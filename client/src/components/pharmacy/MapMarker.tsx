import { useState } from 'react';
import { Pharmacy } from '@shared/schema';

interface MapMarkerProps {
  pharmacy: Pharmacy;
  onClick: () => void;
  lat?: number;  // Richiesto da google-map-react
  lng?: number;  // Richiesto da google-map-react
}

const MapMarker = ({ pharmacy, onClick }: MapMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className={`
          w-6 h-6 bg-primary rounded-full border-2 border-white shadow-md 
          flex items-center justify-center text-white font-bold text-xs
          transition-all duration-200
          ${isHovered ? 'scale-125 bg-primary-dark' : ''}
        `}>
          F
        </div>
        
        {isHovered && (
          <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg text-xs z-30 w-40">
            <h3 className="font-bold text-xs mb-1 truncate">{pharmacy.name}</h3>
            <p className="text-gray-600 truncate">{pharmacy.city}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapMarker;