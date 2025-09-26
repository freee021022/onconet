import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Pharmacy } from '@shared/schema';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const PharmacyCard = ({ pharmacy }: PharmacyCardProps) => {
  const { t } = useTranslation();
  
  // Map specialization values to their display names
  const specializationLabels: Record<string, string> = {
    'preparazioni-galeniche': t('pharmacy.specializations.preparations'),
    'nutrizione-oncologica': t('pharmacy.specializations.nutrition'),
    'supporto-post-chemioterapia': t('pharmacy.specializations.postChemo'),
    'presidi-medico-chirurgici': t('pharmacy.specializations.medical'),
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={pharmacy.imageUrl || "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80"} 
          alt={pharmacy.name} 
          className="w-full h-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full shadow-md">
          <span className="flex items-center">
            <span className="material-icons text-xs mr-1">local_pharmacy</span>
            {t('pharmacy.available')}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1">{pharmacy.name}</h3>
        <div className="flex items-center mb-3">
          <span className="material-icons text-sm text-primary mr-1">location_on</span>
          <p className="text-sm text-neutral-600">{pharmacy.address}, {pharmacy.city}, {pharmacy.region}</p>
        </div>
        <div className="flex items-center mb-3">
          <span className="material-icons text-sm text-primary mr-1">local_phone</span>
          <p className="text-sm text-neutral-600">{pharmacy.phone || t('pharmacy.phoneNotAvailable')}</p>
        </div>
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-1">{t('pharmacy.specializations.title')}:</h4>
          <div className="flex flex-wrap gap-2">
            {pharmacy.specializations && pharmacy.specializations.map((specialization) => (
              <span key={specialization} className="bg-primary-100 text-primary px-2 py-1 rounded-full text-xs">
                {specializationLabels[specialization] || specialization}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="material-icons text-sm">
                {star <= (pharmacy.rating || 0) ? 'star' : 'star_border'}
              </span>
            ))}
          </div>
          <span className="text-xs text-neutral-500 ml-1">
            ({pharmacy.reviewCount || 0} {t('pharmacy.reviews')})
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full bg-white border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-50 transition-colors"
        >
          <span className="material-icons text-sm mr-1 align-text-bottom">info</span>
          {t('pharmacy.details')}
        </Button>
      </div>
    </div>
  );
};

export default PharmacyCard;
