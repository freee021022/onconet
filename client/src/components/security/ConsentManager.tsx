import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, FileText, Users, Database, MessageSquare, 
  Settings, Check, X, AlertTriangle, Clock, User,
  Share, Download, Upload, Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ConsentItem {
  id: string;
  category: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  purpose: string;
  dataTypes: string[];
  recipients: string[];
  retentionPeriod: string;
  lastUpdated: Date;
}

interface ConsentHistory {
  id: string;
  consentId: string;
  action: 'granted' | 'revoked' | 'modified';
  timestamp: Date;
  details: string;
  ipAddress: string;
}

const ConsentManager = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [consentHistory, setConsentHistory] = useState<ConsentHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadConsents();
      loadConsentHistory();
    }
  }, [isAuthenticated]);

  const loadConsents = async () => {
    try {
      // Simula caricamento consensi
      const mockConsents: ConsentItem[] = [
        {
          id: '1',
          category: 'medical',
          title: 'Accesso Cartella Clinica',
          description: 'Autorizzazione per i medici specialisti ad accedere e visualizzare la tua cartella clinica completa',
          required: true,
          granted: true,
          grantedAt: new Date('2025-01-01'),
          purpose: 'Fornire consulenze mediche specialistiche e second opinion',
          dataTypes: ['Dati medici', 'Diagnosi', 'Terapie', 'Esami clinici'],
          recipients: ['Medici specialisti verificati', 'Team medico Onconet'],
          retentionPeriod: '10 anni dalla fine del trattamento',
          lastUpdated: new Date('2025-01-01')
        },
        {
          id: '2',
          category: 'sharing',
          title: 'Condivisione con Farmacie',
          description: 'Permetti alle farmacie partner di accedere alle tue prescrizioni per servizi personalizzati',
          required: false,
          granted: true,
          grantedAt: new Date('2025-01-15'),
          purpose: 'Servizi farmaceutici personalizzati e verifica prescrizioni',
          dataTypes: ['Prescrizioni mediche', 'Lista farmaci', 'Allergie'],
          recipients: ['Farmacie partner certificate', 'Farmacisti autorizzati'],
          retentionPeriod: '5 anni dalla ultima prescrizione',
          lastUpdated: new Date('2025-01-15')
        },
        {
          id: '3',
          category: 'research',
          title: 'Ricerca Scientifica Anonima',
          description: 'Utilizzo anonimo dei tuoi dati per ricerca oncologica e sviluppo di nuove terapie',
          required: false,
          granted: false,
          purpose: 'Ricerca scientifica per migliorare le cure oncologiche',
          dataTypes: ['Dati clinici anonimizzati', 'Outcome terapeutici', 'Dati demografici'],
          recipients: ['Istituti di ricerca partner', 'Università'],
          retentionPeriod: 'Indefinito (dati anonimizzati)',
          lastUpdated: new Date('2025-01-01')
        },
        {
          id: '4',
          category: 'communication',
          title: 'Notifiche e Comunicazioni',
          description: 'Invio di notifiche via email e SMS per promemoria, aggiornamenti e informazioni importanti',
          required: false,
          granted: true,
          grantedAt: new Date('2025-01-01'),
          purpose: 'Comunicazioni essenziali e promemoria per la tua salute',
          dataTypes: ['Email', 'Numero telefono', 'Preferenze di contatto'],
          recipients: ['Sistema Onconet', 'Medici del tuo team'],
          retentionPeriod: 'Fino alla revoca del consenso',
          lastUpdated: new Date('2025-01-01')
        },
        {
          id: '5',
          category: 'analytics',
          title: 'Analisi e Miglioramento Servizi',
          description: 'Utilizzo di dati aggregati per migliorare la piattaforma e personalizzare i servizi',
          required: false,
          granted: true,
          grantedAt: new Date('2025-01-01'),
          purpose: 'Miglioramento continuo della piattaforma e personalizzazione',
          dataTypes: ['Dati di utilizzo', 'Preferenze', 'Feedback'],
          recipients: ['Team di sviluppo Onconet', 'Analisti dati'],
          retentionPeriod: '3 anni',
          lastUpdated: new Date('2025-01-01')
        },
        {
          id: '6',
          category: 'emergency',
          title: 'Accesso di Emergenza',
          description: 'Autorizzazione per medici di emergenza ad accedere ai tuoi dati vitali in caso di emergenza',
          required: true,
          granted: true,
          grantedAt: new Date('2025-01-01'),
          purpose: 'Garantire cure tempestive in situazioni di emergenza',
          dataTypes: ['Dati vitali', 'Allergie', 'Farmaci attuali', 'Condizioni critiche'],
          recipients: ['Medici di pronto soccorso', 'Personale sanitario di emergenza'],
          retentionPeriod: 'Fino alla revoca o per esigenze mediche',
          lastUpdated: new Date('2025-01-01')
        }
      ];

      setConsents(mockConsents);
    } catch (error) {
      toast({
        title: 'Errore caricamento',
        description: 'Impossibile caricare i consensi',
        variant: 'destructive'
      });
    }
  };

  const loadConsentHistory = async () => {
    try {
      const mockHistory: ConsentHistory[] = [
        {
          id: '1',
          consentId: '2',
          action: 'granted',
          timestamp: new Date('2025-01-15'),
          details: 'Consenso concesso per condivisione con farmacie',
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          consentId: '1',
          action: 'granted',
          timestamp: new Date('2025-01-01'),
          details: 'Consenso iniziale per accesso cartella clinica',
          ipAddress: '192.168.1.100'
        },
        {
          id: '3',
          consentId: '3',
          action: 'revoked',
          timestamp: new Date('2025-01-10'),
          details: 'Consenso revocato per ricerca scientifica',
          ipAddress: '192.168.1.100'
        }
      ];

      setConsentHistory(mockHistory);
    } catch (error) {
      console.error('Errore caricamento cronologia consensi:', error);
    }
  };

  const updateConsent = async (consentId: string, granted: boolean) => {
    setIsUpdating(true);
    try {
      const updatedConsents = consents.map(consent => {
        if (consent.id === consentId) {
          return {
            ...consent,
            granted,
            grantedAt: granted ? new Date() : consent.grantedAt,
            revokedAt: !granted ? new Date() : undefined,
            lastUpdated: new Date()
          };
        }
        return consent;
      });

      setConsents(updatedConsents);

      // Aggiungi alla cronologia
      const newHistoryItem: ConsentHistory = {
        id: Date.now().toString(),
        consentId,
        action: granted ? 'granted' : 'revoked',
        timestamp: new Date(),
        details: `Consenso ${granted ? 'concesso' : 'revocato'} dall'utente`,
        ipAddress: '192.168.1.100'
      };

      setConsentHistory(prev => [newHistoryItem, ...prev]);

      toast({
        title: granted ? 'Consenso concesso' : 'Consenso revocato',
        description: `Il consenso è stato ${granted ? 'concesso' : 'revocato'} con successo`
      });
    } catch (error) {
      toast({
        title: 'Errore aggiornamento',
        description: 'Impossibile aggiornare il consenso',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportConsents = async () => {
    try {
      const data = consents.map(consent => ({
        Categoria: consent.category,
        Titolo: consent.title,
        Stato: consent.granted ? 'Concesso' : 'Revocato',
        'Data Consenso': consent.grantedAt?.toISOString() || 'N/A',
        'Data Revoca': consent.revokedAt?.toISOString() || 'N/A',
        Scopo: consent.purpose,
        'Periodo Conservazione': consent.retentionPeriod
      }));

      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consensi_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast({
        title: 'Export completato',
        description: 'Consensi esportati con successo'
      });
    } catch (error) {
      toast({
        title: 'Errore export',
        description: 'Impossibile esportare i consensi',
        variant: 'destructive'
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <FileText className="h-4 w-4" />;
      case 'sharing': return <Share className="h-4 w-4" />;
      case 'research': return <Database className="h-4 w-4" />;
      case 'communication': return <Bell className="h-4 w-4" />;
      case 'analytics': return <Settings className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'medical': return 'Medico';
      case 'sharing': return 'Condivisione';
      case 'research': return 'Ricerca';
      case 'communication': return 'Comunicazioni';
      case 'analytics': return 'Analisi';
      case 'emergency': return 'Emergenza';
      default: return category;
    }
  };

  const categories = ['all', ...Array.from(new Set(consents.map(c => c.category)))];
  const filteredConsents = selectedCategory === 'all' 
    ? consents 
    : consents.filter(c => c.category === selectedCategory);

  const grantedCount = consents.filter(c => c.granted).length;
  const requiredCount = consents.filter(c => c.required).length;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
            <p className="text-gray-600">
              Effettua l'accesso per gestire i tuoi consensi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panoramica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{grantedCount}</p>
                <p className="text-sm text-gray-600">Consensi Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requiredCount}</p>
                <p className="text-sm text-gray-600">Consensi Obbligatori</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{consents.length}</p>
                <p className="text-sm text-gray-600">Consensi Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controlli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestione Consensi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'all' ? 'Tutti' : getCategoryName(category)}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Cronologia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConsents}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Consensi */}
      <div className="space-y-4">
        {filteredConsents.map((consent) => (
          <Card key={consent.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getCategoryIcon(consent.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{consent.title}</h3>
                        <Badge variant={consent.category === 'emergency' ? 'destructive' : 'secondary'}>
                          {getCategoryName(consent.category)}
                        </Badge>
                        {consent.required && (
                          <Badge variant="outline">Obbligatorio</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{consent.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium mb-1">Scopo:</p>
                          <p className="text-gray-600">{consent.purpose}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Conservazione:</p>
                          <p className="text-gray-600">{consent.retentionPeriod}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Tipi di dati:</p>
                          <div className="flex flex-wrap gap-1">
                            {consent.dataTypes.map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Destinatari:</p>
                          <div className="flex flex-wrap gap-1">
                            {consent.recipients.map((recipient, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {recipient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={consent.granted}
                      onCheckedChange={(checked) => updateConsent(consent.id, checked)}
                      disabled={consent.required || isUpdating}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {consent.granted && consent.grantedAt && (
                        <div>Concesso: {consent.grantedAt.toLocaleDateString()}</div>
                      )}
                      {consent.revokedAt && (
                        <div>Revocato: {consent.revokedAt.toLocaleDateString()}</div>
                      )}
                      <div>Aggiornato: {consent.lastUpdated.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cronologia */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cronologia Consensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consentHistory.map((item) => {
                const consent = consents.find(c => c.id === item.consentId);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {item.action === 'granted' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {consent?.title || 'Consenso sconosciuto'}
                      </p>
                      <p className="text-xs text-gray-600">{item.details}</p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{item.timestamp.toLocaleDateString()}</div>
                      <div>{item.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsentManager;