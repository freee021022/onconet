import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, Lock, Key, RefreshCw, AlertTriangle, 
  Check, Database, FileText, MessageSquare, 
  Download, Upload, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface EncryptionKey {
  id: string;
  name: string;
  type: 'master' | 'device' | 'session';
  algorithm: string;
  strength: number;
  createdAt: Date;
  lastUsed: Date;
  status: 'active' | 'expired' | 'revoked';
}

interface EncryptedData {
  id: string;
  type: 'medical_record' | 'document' | 'message' | 'profile';
  title: string;
  size: string;
  encrypted: boolean;
  algorithm: string;
  keyId: string;
  lastModified: Date;
}

const EncryptionManager = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [encryptedData, setEncryptedData] = useState<EncryptedData[]>([]);
  const [autoEncryption, setAutoEncryption] = useState(true);
  const [encryptionLevel, setEncryptionLevel] = useState<'standard' | 'high' | 'maximum'>('high');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [securityScore, setSecurityScore] = useState(85);

  useEffect(() => {
    if (isAuthenticated) {
      loadEncryptionData();
      calculateSecurityScore();
    }
  }, [isAuthenticated]);

  const loadEncryptionData = async () => {
    // Simula caricamento dati crittografia
    const mockKeys: EncryptionKey[] = [
      {
        id: '1',
        name: 'Chiave Master Dispositivo',
        type: 'master',
        algorithm: 'AES-256-GCM',
        strength: 256,
        createdAt: new Date('2025-01-01'),
        lastUsed: new Date(),
        status: 'active'
      },
      {
        id: '2',
        name: 'Chiave Sessione Corrente',
        type: 'session',
        algorithm: 'ChaCha20-Poly1305',
        strength: 256,
        createdAt: new Date(),
        lastUsed: new Date(),
        status: 'active'
      }
    ];

    const mockData: EncryptedData[] = [
      {
        id: '1',
        type: 'medical_record',
        title: 'Cartella Clinica Completa',
        size: '2.3 MB',
        encrypted: true,
        algorithm: 'AES-256-GCM',
        keyId: '1',
        lastModified: new Date()
      },
      {
        id: '2',
        type: 'document',
        title: 'Documenti Medici Scansionati',
        size: '15.7 MB',
        encrypted: true,
        algorithm: 'AES-256-GCM',
        keyId: '1',
        lastModified: new Date()
      }
    ];

    setEncryptionKeys(mockKeys);
    setEncryptedData(mockData);
  };

  const calculateSecurityScore = () => {
    let score = 0;
    
    // Verifica crittografia attiva
    if (autoEncryption) score += 30;
    
    // Livello di crittografia
    switch (encryptionLevel) {
      case 'maximum': score += 40; break;
      case 'high': score += 30; break;
      case 'standard': score += 20; break;
    }
    
    // Chiavi attive
    const activeKeys = encryptionKeys.filter(k => k.status === 'active').length;
    score += Math.min(activeKeys * 10, 30);
    
    setSecurityScore(score);
  };

  const generateNewKey = async () => {
    setIsGeneratingKey(true);
    setEncryptionProgress(0);

    try {
      // Simula generazione chiave sicura
      for (let i = 0; i <= 100; i += 10) {
        setEncryptionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newKey: EncryptionKey = {
        id: Date.now().toString(),
        name: `Chiave Dispositivo ${new Date().toLocaleDateString()}`,
        type: 'device',
        algorithm: 'AES-256-GCM',
        strength: 256,
        createdAt: new Date(),
        lastUsed: new Date(),
        status: 'active'
      };

      setEncryptionKeys(prev => [...prev, newKey]);
      
      toast({
        title: 'Nuova chiave generata',
        description: 'Chiave di crittografia creata con successo'
      });
    } catch (error) {
      toast({
        title: 'Errore generazione chiave',
        description: 'Impossibile generare la nuova chiave',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingKey(false);
      setEncryptionProgress(0);
    }
  };

  const revokeKey = async (keyId: string) => {
    setEncryptionKeys(prev =>
      prev.map(key =>
        key.id === keyId
          ? { ...key, status: 'revoked' as const }
          : key
      )
    );

    toast({
      title: 'Chiave revocata',
      description: 'La chiave è stata revocata con successo'
    });
  };

  const encryptAllData = async () => {
    setIsGeneratingKey(true);
    setEncryptionProgress(0);

    try {
      for (let i = 0; i <= 100; i += 5) {
        setEncryptionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setEncryptedData(prev =>
        prev.map(data => ({ ...data, encrypted: true }))
      );

      toast({
        title: 'Crittografia completata',
        description: 'Tutti i dati sono stati crittografati'
      });
    } catch (error) {
      toast({
        title: 'Errore crittografia',
        description: 'Impossibile completare la crittografia',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingKey(false);
      setEncryptionProgress(0);
    }
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case 'AES-256-GCM': return 'bg-green-100 text-green-800';
      case 'ChaCha20-Poly1305': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'medical_record': return <FileText className="h-4 w-4" />;
      case 'document': return <Database className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
            <p className="text-gray-600">
              Effettua l'accesso per gestire la crittografia dei tuoi dati
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Livello di Sicurezza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-green-600">{securityScore}%</div>
              <p className="text-sm text-gray-600">Punteggio sicurezza</p>
            </div>
            <div className="text-right">
              <Badge variant={securityScore >= 80 ? 'default' : 'destructive'}>
                {securityScore >= 80 ? 'Sicuro' : 'Richiede attenzione'}
              </Badge>
            </div>
          </div>
          <Progress value={securityScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Encryption Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Impostazioni Crittografia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-encryption">Crittografia Automatica</Label>
              <p className="text-sm text-gray-600">
                Critta automaticamente tutti i nuovi dati
              </p>
            </div>
            <Switch
              id="auto-encryption"
              checked={autoEncryption}
              onCheckedChange={setAutoEncryption}
            />
          </div>

          <div className="space-y-2">
            <Label>Livello di Crittografia</Label>
            <div className="grid grid-cols-3 gap-2">
              {['standard', 'high', 'maximum'].map((level) => (
                <Button
                  key={level}
                  variant={encryptionLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEncryptionLevel(level as any)}
                  className="text-xs"
                >
                  {level === 'standard' && 'Standard'}
                  {level === 'high' && 'Alto'}
                  {level === 'maximum' && 'Massimo'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateNewKey}
              disabled={isGeneratingKey}
              className="flex items-center gap-2"
            >
              {isGeneratingKey ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Genera Nuova Chiave
            </Button>
            
            <Button
              onClick={encryptAllData}
              disabled={isGeneratingKey}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Critta Tutti i Dati
            </Button>
          </div>

          {/* Progress */}
          {isGeneratingKey && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Elaborazione in corso...</span>
                <span className="text-sm">{encryptionProgress}%</span>
              </div>
              <Progress value={encryptionProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encryption Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chiavi di Crittografia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {encryptionKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{key.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getAlgorithmColor(key.algorithm)}>
                        {key.algorithm}
                      </Badge>
                      <Badge className={getStatusColor(key.status)}>
                        {key.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {key.strength} bit
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs text-gray-500">
                    <div>Creata: {key.createdAt.toLocaleDateString()}</div>
                    <div>Ultimo uso: {key.lastUsed.toLocaleDateString()}</div>
                  </div>
                  {key.status === 'active' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => revokeKey(key.id)}
                    >
                      Revoca
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encrypted Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dati Crittografati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {encryptedData.map((data) => (
              <div key={data.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getDataTypeIcon(data.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{data.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{data.size}</span>
                      <Badge className={getAlgorithmColor(data.algorithm)}>
                        {data.algorithm}
                      </Badge>
                      {data.encrypted && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Crittografato
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Modificato: {data.lastModified.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionManager;