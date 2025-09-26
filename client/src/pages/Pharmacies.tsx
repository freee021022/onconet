import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Pharmacy } from '@shared/schema';
import AdvancedPharmacyMap from '@/components/maps/AdvancedPharmacyMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, Smartphone, MapPin, Clock, Star } from 'lucide-react';

const Pharmacies = () => {
  const { t } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Mappa Farmacie Oncologiche
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Trova farmacie specializzate in oncologia con navigazione GPS avanzata, 
              filtri intelligenti e informazioni in tempo reale su orari e servizi
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Navigation className="h-4 w-4 mr-2" />
                Navigazione GPS
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <MapPin className="h-4 w-4 mr-2" />
                Geolocalizzazione
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Orari Real-time
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Recensioni
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile-First
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-gray-800">
                Mappa Interattiva con Funzionalità Avanzate
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Utilizza la geolocalizzazione, applica filtri per specializzazione e ottieni indicazioni turn-by-turn
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <AdvancedPharmacyMap onPharmacySelect={setSelectedPharmacy} />
            </CardContent>
          </Card>
          
          {/* Features Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border border-blue-200 bg-blue-50/50">
              <CardContent className="p-6 text-center">
                <Navigation className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Navigazione GPS</h3>
                <p className="text-sm text-gray-600">
                  Ottieni indicazioni turn-by-turn verso la farmacia selezionata
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Geolocalizzazione</h3>
                <p className="text-sm text-gray-600">
                  Trova automaticamente le farmacie più vicine alla tua posizione
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-purple-200 bg-purple-50/50">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Filtri Intelligenti</h3>
                <p className="text-sm text-gray-600">
                  Filtra per specializzazione e distanza per trovare il servizio perfetto
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Perché usare la nostra mappa?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Funzionalità Avanzate
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ricerca automatica basata sulla posizione GPS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Filtri per specializzazione oncologica</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calcolo automatico delle distanze</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Navigazione turn-by-turn integrata</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Specializzazioni Oncologiche
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Preparazioni galeniche personalizzate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Nutrizione oncologica specializzata</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Supporto post-chemioterapia</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Presidi medico-chirurgici oncologici</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pharmacies;