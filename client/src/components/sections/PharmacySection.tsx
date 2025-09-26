import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PharmacyCard from '../pharmacy/PharmacyCard';
import SimpleMapComponent from '../pharmacy/SimpleMapComponent';
import { Pharmacy } from '@shared/schema';

interface PharmacySectionProps {
  pharmacies: Pharmacy[];
}

const PharmacySection = ({ pharmacies }: PharmacySectionProps) => {
  const { t, language } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  // Extract unique regions from pharmacies
  const regionsSet = new Set(pharmacies.map(pharmacy => pharmacy.region));
  const regions = Array.from(regionsSet);
  
  // Extract cities based on selected region
  const cities = selectedRegion 
    ? Array.from(new Set(pharmacies
        .filter(pharmacy => pharmacy.region === selectedRegion)
        .map(pharmacy => pharmacy.city)))
    : [];
  
  // Get featured pharmacies (limit to 3)
  const featuredPharmacies = pharmacies
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);
  
  const handleSearch = () => {
    // In a real app, this would filter pharmacies and update the map
    setIsMapLoaded(true);
  };
  
  const specializations = [
    { value: 'preparazioni-galeniche', label: t('pharmacy.specializations.preparations') },
    { value: 'nutrizione-oncologica', label: t('pharmacy.specializations.nutrition') },
    { value: 'supporto-post-chemioterapia', label: t('pharmacy.specializations.postChemo') },
    { value: 'presidi-medico-chirurgici', label: t('pharmacy.specializations.medical') },
  ];
  
  return (
    <section id="farmacie" className="py-12 md:py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 section-title mx-auto centered" style={{ width: 'fit-content' }}>
            {t('pharmacy.title')}
          </h2>
          <p className="text-lg text-neutral-600">{t('pharmacy.description')}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200">
              <h3 className="text-xl font-bold mb-4">{t('pharmacy.search')}</h3>
              <div className="mb-6">
                <label htmlFor="region" className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('pharmacy.region')}
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region" className="w-full">
                    <SelectValue placeholder={t('pharmacy.selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">{t('pharmacy.selectRegion')}</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-6">
                <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('pharmacy.city')}
                </label>
                <Select 
                  value={selectedCity} 
                  onValueChange={setSelectedCity}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue placeholder={t('pharmacy.selectCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-cities">{t('pharmacy.selectCity')}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-6">
                <label htmlFor="specialization" className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('pharmacy.specialization')}
                </label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger id="specialization" className="w-full">
                    <SelectValue placeholder={t('pharmacy.allSpecializations')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('pharmacy.allSpecializations')}</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-primary text-white px-4 py-3 rounded-md font-bold hover:bg-primary/90 transition-colors"
                onClick={handleSearch}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">search</span>
                {t('pharmacy.searchButton')}
              </Button>
            </div>
            <div className="lg:w-2/3">
              <div className="h-96 bg-neutral-100 relative">
                {isMapLoaded ? (
                  <SimpleMapComponent 
                    pharmacies={
                      selectedRegion
                        ? pharmacies.filter(p => p.region === selectedRegion && 
                            (selectedCity ? p.city === selectedCity : true) &&
                            (selectedSpecialization ? p.specializations && p.specializations.includes(selectedSpecialization) : true))
                        : pharmacies
                    } 
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=500&q=80" 
                      alt={t('pharmacy.mapImageAlt')} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/50">
                      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                        <h4 className="text-xl font-bold mb-2">{t('pharmacy.interactiveMap')}</h4>
                        <p className="text-neutral-600 mb-4">{t('pharmacy.selectRegionToView')}</p>
                        <Button 
                          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors w-full"
                          onClick={() => setIsMapLoaded(true)}
                        >
                          <span className="material-icons text-sm mr-1 align-text-bottom">map</span>
                          {t('pharmacy.loadMapButton')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-6">{t('pharmacy.featuredPharmacies')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/pharmacies">
            <Button
              variant="outline"
              className="bg-white border border-neutral-200 px-6 py-3 rounded-md text-neutral-700 font-medium hover:bg-neutral-50"
            >
              {t('pharmacy.viewAllPharmacies')}
              <span className="material-icons text-sm ml-1 align-text-bottom">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PharmacySection;
