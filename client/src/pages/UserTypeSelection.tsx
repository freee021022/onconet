import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck, Building2 } from 'lucide-react';

const UserTypeSelection = () => {
  const { t } = useTranslation();

  const userTypes = [
    {
      type: 'patient',
      title: 'Paziente',
      description: 'Sei un paziente oncologico o un familiare che cerca supporto e informazioni',
      icon: User,
      color: 'bg-blue-500',
      features: [
        'Accesso al forum della comunità',
        'Richiesta di seconde opinioni mediche',
        'Ricerca farmacie specializzate',
        'Supporto emotivo e informativo'
      ]
    },
    {
      type: 'professional',
      title: 'Professionista Sanitario',
      description: 'Sei un oncologo, medico specialista o operatore sanitario',
      icon: UserCheck,
      color: 'bg-green-500',
      features: [
        'Fornire seconde opinioni mediche',
        'Partecipare alle discussioni del forum',
        'Accesso a strumenti professionali',
        'Network con altri specialisti'
      ]
    },
    {
      type: 'pharmacy',
      title: 'Farmacia Oncologica',
      description: 'Rappresenti una farmacia specializzata in prodotti oncologici',
      icon: Building2,
      color: 'bg-purple-500',
      features: [
        'Profilo farmacia sulla piattaforma',
        'Visibilità nella mappa delle farmacie',
        'Gestione specializzazioni e servizi',
        'Connessione diretta con pazienti'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Benvenuto su Onconet24
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scegli il tipo di profilo più adatto a te per iniziare
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {userTypes.map((userType) => {
            const IconComponent = userType.icon;
            return (
              <Card key={userType.type} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{userType.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {userType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {userType.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/register?type=${userType.type}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Registrati come {userType.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Hai già un account?
          </p>
          <Link href="/login">
            <Button variant="outline" className="px-8">
              Accedi
            </Button>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-6">
            Perché scegliere Onconet?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Comunità Sicura</h3>
              <p className="text-sm text-gray-600">
                Un ambiente protetto dove condividere esperienze e ricevere supporto
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Professionisti Verificati</h3>
              <p className="text-sm text-gray-600">
                Tutti i medici e farmacisti sono verificati e autorizzati
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Rete Nazionale</h3>
              <p className="text-sm text-gray-600">
                Accesso a specialisti e farmacie in tutta Italia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;