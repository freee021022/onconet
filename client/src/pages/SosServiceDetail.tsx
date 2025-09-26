import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Clock, Shield, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const SosServiceDetail = () => {
  const { t } = useTranslation();

  const handleDownloadPDF = () => {
    // Placeholder for future PDF download functionality
    alert('Il file PDF sarà disponibile prossimamente. Contatta il supporto per maggiori informazioni.');
  };

  const features = [
    {
      icon: Users,
      title: "Rete di Specialisti Verificati",
      description: "Accesso a oncologi certificati e specialisti di alto livello provenienti dai principali ospedali italiani"
    },
    {
      icon: Clock,
      title: "Risposta Rapida",
      description: "Tempi di risposta garantiti entro 48-72 ore per casi urgenti"
    },
    {
      icon: Shield,
      title: "Privacy e Sicurezza",
      description: "Tutti i dati medici sono trattati secondo le normative GDPR e protetti con crittografia avanzata"
    },
    {
      icon: FileText,
      title: "Documentazione Completa",
      description: "Ricevi un report dettagliato con la seconda opinione e raccomandazioni specifiche"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Richiesta Iniziale",
      description: "Completa il modulo con i tuoi dati medici e carica la documentazione clinica esistente"
    },
    {
      step: 2,
      title: "Assegnazione Specialista",
      description: "Il sistema assegna automaticamente lo specialista più adatto alla tua patologia"
    },
    {
      step: 3,
      title: "Revisione Documenti",
      description: "Lo specialista esamina approfonditamente tutta la documentazione fornita"
    },
    {
      step: 4,
      title: "Consulto e Report",
      description: "Ricevi la seconda opinione dettagliata con raccomandazioni personalizzate"
    }
  ];

  const pricing = [
    {
      type: "Consulto Standard",
      price: "€ 150",
      features: [
        "Revisione documentazione clinica",
        "Report scritto dettagliato",
        "Risposta entro 5 giorni lavorativi",
        "Un follow-up via email"
      ]
    },
    {
      type: "Consulto Urgente",
      price: "€ 250",
      features: [
        "Revisione prioritaria",
        "Report scritto + chiamata telefonica",
        "Risposta entro 48 ore",
        "Due follow-up inclusi"
      ],
      recommended: true
    },
    {
      type: "Consulto Premium",
      price: "€ 350",
      features: [
        "Revisione da due specialisti",
        "Videoconferenza di 30 minuti",
        "Report completo con bibliografia",
        "Follow-up illimitati per 30 giorni"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            SOS: Servizio di Seconda Opinione
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Ottieni una seconda opinione medica qualificata da specialisti oncologi verificati per prendere decisioni informate sul tuo percorso di cura.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Richiedi Consulto
            </Button>
            <Button size="lg" variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Scarica Brochure PDF
            </Button>
          </div>
        </div>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perché Scegliere il Nostro Servizio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Come Funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Tariffe Trasparenti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <Card key={index} className={`relative ${plan.recommended ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Consigliato
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.type}</CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.recommended ? "default" : "outline"}>
                    Scegli Piano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Domande Frequenti</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold mb-2">Quanto tempo richiede una seconda opinione?</h3>
                <p className="text-gray-600">I tempi variano in base al tipo di consulto scelto: da 48 ore per il consulto urgente fino a 5 giorni lavorativi per quello standard.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quali documenti devo fornire?</h3>
                <p className="text-gray-600">Referti medici, esami diagnostici (TAC, RMN, PET), referti istologici, e qualsiasi altra documentazione clinica rilevante.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">La seconda opinione sostituisce il mio medico curante?</h3>
                <p className="text-gray-600">No, la seconda opinione è un servizio integrativo che fornisce un punto di vista aggiuntivo. È importante discutere sempre i risultati con il proprio medico curante.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">I miei dati sono al sicuro?</h3>
                <p className="text-gray-600">Sì, tutti i dati sono trattati secondo le normative GDPR e protetti con crittografia di livello bancario.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white max-w-3xl mx-auto">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Pronto per la Tua Seconda Opinione?</h2>
              <p className="text-xl mb-8 opacity-90">
                Non aspettare. La tua salute merita il meglio della medicina specialistica italiana.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary">
                  Inizia Ora
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  Contatta Supporto
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SosServiceDetail;