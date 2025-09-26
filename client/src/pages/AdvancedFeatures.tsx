import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Map, MessageCircle, FileText, Bot, RefreshCw, Send,
  Calendar, Star, Navigation, Camera, Brain, Smartphone,
  Shield, Lock, Eye, Database, Zap
} from 'lucide-react';
import AdvancedPharmacyMap from '@/components/maps/AdvancedPharmacyMap';
import PharmacyReviews from '@/components/pharmacy/PharmacyReviews';
import MedicalRecords from '@/components/medical/MedicalRecords';

import OfflineSync from '@/components/offline/OfflineSync';

import CalendarIntegration from '@/components/calendar/CalendarIntegration';
import EncryptionManager from '@/components/security/EncryptionManager';
import AuditTrail from '@/components/security/AuditTrail';
import ConsentManager from '@/components/security/ConsentManager';
import BackupManager from '@/components/security/BackupManager';


const AdvancedFeatures = () => {
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);

  const features = [
    {
      id: 'pharmacy-map',
      title: 'Mappa Farmacie Avanzata',
      description: 'Navigazione turn-by-turn, orari in tempo reale, clustering intelligente',
      icon: <Map className="h-6 w-6" />,
      badge: 'Nuovo',
      highlights: ['Google Maps integrato', 'Indicazioni GPS', 'Cluster automatico', 'Stato apertura live']
    },
    {
      id: 'reviews',
      title: 'Recensioni e Valutazioni',
      description: 'Sistema completo di recensioni per farmacie e servizi',
      icon: <Star className="h-6 w-6" />,
      badge: 'Nuovo',
      highlights: ['Recensioni verificate', 'Sistema di valutazione', 'Segnalazioni', 'Filtri avanzati']
    },
    {
      id: 'medical-records',
      title: 'Cartella Clinica Digitale',
      description: 'Gestione completa dei documenti medici con organizzazione intelligente',
      icon: <FileText className="h-6 w-6" />,
      badge: 'Nuovo',
      highlights: ['Upload sicuro', 'Categorizzazione automatica', 'Condivisione selettiva', 'Ricerca avanzata']
    },

    {
      id: 'offline-sync',
      title: 'Modalità Offline',
      description: 'Accesso ai dati essenziali anche senza connessione internet',
      icon: <RefreshCw className="h-6 w-6" />,
      badge: 'Pro',
      highlights: ['Dati offline', 'Sincronizzazione auto', 'Cache intelligente', 'Backup locale']
    },

    {
      id: 'calendar',
      title: 'Integrazione Calendario',
      description: 'Sincronizzazione con calendari esterni e gestione appuntamenti',
      icon: <Calendar className="h-6 w-6" />,
      badge: 'Pro',
      highlights: ['Multi-calendario', 'Sync bidirezionale', 'Gestione appuntamenti', 'Notifiche push']
    },
    {
      id: 'encryption-manager',
      title: 'Crittografia End-to-End',
      description: 'Protezione massima dei dati sensibili con crittografia avanzata',
      icon: <Lock className="h-6 w-6" />,
      badge: 'Security',
      highlights: ['AES-256', 'Chiavi multiple', 'Crittografia automatica', 'Zero-knowledge']
    },
    {
      id: 'audit-trail',
      title: 'Audit Trail Completo',
      description: 'Tracciamento dettagliato di tutti gli accessi e le modifiche',
      icon: <Eye className="h-6 w-6" />,
      badge: 'Security',
      highlights: ['Log completi', 'Monitoraggio real-time', 'Analisi rischi', 'Export dati']
    },
    {
      id: 'consent-manager',
      title: 'Consensi Granulari',
      description: 'Controllo dettagliato della condivisione e utilizzo dei dati',
      icon: <Shield className="h-6 w-6" />,
      badge: 'Privacy',
      highlights: ['Consensi specifici', 'Revoca immediata', 'Cronologia completa', 'GDPR compliant']
    },
    {
      id: 'backup-manager',
      title: 'Backup Sicuro',
      description: 'Sistema ridondante per la protezione e il ripristino dei dati',
      icon: <Database className="h-6 w-6" />,
      badge: 'Backup',
      highlights: ['Multi-destinazione', 'Backup automatici', 'Ripristino veloce', 'Crittografia totale']
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Funzionalità Avanzate Onconet
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esplora le nuove funzionalità che trasformano Onconet in una piattaforma 
            sanitaria completa e all'avanguardia
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">

            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Navigation className="h-3 w-3 mr-1" />
              Navigazione GPS
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile-First
            </Badge>

          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      feature.badge === 'Pro' ? 'bg-green-600 text-white' :
                      feature.badge === 'Security' ? 'bg-red-600 text-white' :
                      feature.badge === 'Privacy' ? 'bg-orange-600 text-white' :
                      feature.badge === 'Backup' ? 'bg-gray-600 text-white' :
                      feature.badge === 'Realtime' ? 'bg-purple-600 text-white' :
                      'bg-blue-600 text-white'
                    }
                  >
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Demo */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Demo Interattivo</CardTitle>
            <p className="text-center text-gray-600">
              Prova le nuove funzionalità direttamente dal tuo browser
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pharmacy-map" className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full mb-6">
                <TabsTrigger value="pharmacy-map" className="text-xs">
                  <Map className="h-4 w-4 mr-1" />
                  Mappa
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs">
                  <Star className="h-4 w-4 mr-1" />
                  Recensioni
                </TabsTrigger>
                <TabsTrigger value="medical-records" className="text-xs">
                  <FileText className="h-4 w-4 mr-1" />
                  Cartella
                </TabsTrigger>

                <TabsTrigger value="offline-sync" className="text-xs">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Offline
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="encryption-manager" className="text-xs">
                  <Lock className="h-4 w-4 mr-1" />
                  Crittografia
                </TabsTrigger>
                <TabsTrigger value="audit-trail" className="text-xs">
                  <Eye className="h-4 w-4 mr-1" />
                  Audit
                </TabsTrigger>
                <TabsTrigger value="consent-manager" className="text-xs">
                  <Shield className="h-4 w-4 mr-1" />
                  Consensi
                </TabsTrigger>
                <TabsTrigger value="backup-manager" className="text-xs">
                  <Database className="h-4 w-4 mr-1" />
                  Backup
                </TabsTrigger>

              </TabsList>

              <TabsContent value="pharmacy-map" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Mappa Farmacie con Navigazione GPS</h3>
                  <p className="text-gray-600">
                    Trova farmacie specializzate, ottieni indicazioni turn-by-turn e visualizza orari in tempo reale
                  </p>
                </div>
                <AdvancedPharmacyMap onPharmacySelect={setSelectedPharmacy} />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Sistema di Recensioni</h3>
                  <p className="text-gray-600">
                    Leggi e scrivi recensioni per farmacie e servizi, con sistema di verifica
                  </p>
                </div>
                <PharmacyReviews pharmacyId={selectedPharmacy?.id || 1} />
              </TabsContent>

              <TabsContent value="medical-records" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Cartella Clinica Digitale</h3>
                  <p className="text-gray-600">
                    Organizza, condividi e accedi ai tuoi documenti medici in modo sicuro
                  </p>
                </div>
                <MedicalRecords />
              </TabsContent>



              <TabsContent value="offline-sync" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Modalità Offline</h3>
                  <p className="text-gray-600">
                    Accedi ai dati essenziali anche senza connessione internet
                  </p>
                </div>
                <OfflineSync />
              </TabsContent>



              <TabsContent value="calendar" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Integrazione Calendario</h3>
                  <p className="text-gray-600">
                    Sincronizza appuntamenti con i tuoi calendari esterni
                  </p>
                </div>
                <CalendarIntegration />
              </TabsContent>

              <TabsContent value="encryption-manager" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Crittografia End-to-End</h3>
                  <p className="text-gray-600">
                    Protezione massima dei tuoi dati sensibili con crittografia avanzata
                  </p>
                </div>
                <EncryptionManager />
              </TabsContent>

              <TabsContent value="audit-trail" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Audit Trail Completo</h3>
                  <p className="text-gray-600">
                    Tracciamento dettagliato di tutti gli accessi e le modifiche ai tuoi dati
                  </p>
                </div>
                <AuditTrail />
              </TabsContent>

              <TabsContent value="consent-manager" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Gestione Consensi Granulari</h3>
                  <p className="text-gray-600">
                    Controllo dettagliato della condivisione e utilizzo dei tuoi dati personali
                  </p>
                </div>
                <ConsentManager />
              </TabsContent>

              <TabsContent value="backup-manager" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Sistema Backup Sicuro</h3>
                  <p className="text-gray-600">
                    Protezione ridondante e ripristino veloce dei tuoi dati medici
                  </p>
                </div>
                <BackupManager />
              </TabsContent>


            </Tabs>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Stack Tecnologico</CardTitle>
            <p className="text-center text-gray-600">
              Tecnologie all'avanguardia per un'esperienza utente superiore
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Map className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold">Mappe</h4>
                <p className="text-sm text-gray-600">Google Maps API</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold">Mobile</h4>
                <p className="text-sm text-gray-600">PWA, Responsive</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-semibold">Sync</h4>
                <p className="text-sm text-gray-600">Real-time, Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default AdvancedFeatures;