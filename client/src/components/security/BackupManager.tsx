import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, Cloud, HardDrive, RefreshCw, Download, 
  Upload, Shield, Check, AlertTriangle, Clock, 
  Server, Globe, Lock, Archive, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface BackupLocation {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'hybrid';
  provider: string;
  encrypted: boolean;
  available: boolean;
  capacity: string;
  used: string;
  lastSync: Date;
}

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  lastRun: Date;
  nextRun: Date;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  dataTypes: string[];
  size: string;
  duration: string;
  destination: string;
}

interface BackupHistory {
  id: string;
  jobId: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'differential';
  status: 'success' | 'failed' | 'partial';
  size: string;
  duration: string;
  filesProcessed: number;
  errors: string[];
}

const BackupManager = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [backupLocations, setBackupLocations] = useState<BackupLocation[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState(30);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [totalBackups, setTotalBackups] = useState(0);
  const [successfulBackups, setSuccessfulBackups] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadBackupData();
      calculateBackupStats();
    }
  }, [isAuthenticated]);

  const loadBackupData = async () => {
    try {
      // Simula caricamento dati backup
      const mockLocations: BackupLocation[] = [
        {
          id: '1',
          name: 'Onconet Cloud Primario',
          type: 'cloud',
          provider: 'Onconet Secure Cloud',
          encrypted: true,
          available: true,
          capacity: '100 GB',
          used: '23.4 GB',
          lastSync: new Date()
        },
        {
          id: '2',
          name: 'Backup Locale Dispositivo',
          type: 'local',
          provider: 'Dispositivo Locale',
          encrypted: true,
          available: true,
          capacity: '50 GB',
          used: '15.2 GB',
          lastSync: new Date(Date.now() - 3600000)
        },
        {
          id: '3',
          name: 'Backup Cloud Secondario',
          type: 'cloud',
          provider: 'Azure Backup',
          encrypted: true,
          available: true,
          capacity: '200 GB',
          used: '23.4 GB',
          lastSync: new Date(Date.now() - 86400000)
        }
      ];

      const mockJobs: BackupJob[] = [
        {
          id: '1',
          name: 'Backup Completo Cartella Clinica',
          type: 'full',
          schedule: 'Settimanale - Domenica 02:00',
          lastRun: new Date(Date.now() - 86400000),
          nextRun: new Date(Date.now() + 518400000),
          status: 'completed',
          dataTypes: ['Cartella clinica', 'Documenti medici', 'Immagini diagnostiche'],
          size: '15.2 GB',
          duration: '45 min',
          destination: 'Onconet Cloud Primario'
        },
        {
          id: '2',
          name: 'Backup Incrementale Giornaliero',
          type: 'incremental',
          schedule: 'Giornaliero - 03:00',
          lastRun: new Date(Date.now() - 3600000),
          nextRun: new Date(Date.now() + 82800000),
          status: 'completed',
          dataTypes: ['Nuovi documenti', 'Messaggi', 'Preferenze'],
          size: '2.1 GB',
          duration: '8 min',
          destination: 'Backup Locale Dispositivo'
        },
        {
          id: '3',
          name: 'Backup Sicurezza Critico',
          type: 'differential',
          schedule: 'Ogni 4 ore',
          lastRun: new Date(Date.now() - 14400000),
          nextRun: new Date(Date.now() + 0),
          status: 'scheduled',
          dataTypes: ['Dati critici', 'Consensi', 'Chiavi crittografia'],
          size: '500 MB',
          duration: '3 min',
          destination: 'Backup Cloud Secondario'
        }
      ];

      const mockHistory: BackupHistory[] = [
        {
          id: '1',
          jobId: '2',
          timestamp: new Date(Date.now() - 3600000),
          type: 'incremental',
          status: 'success',
          size: '2.1 GB',
          duration: '8 min 32 sec',
          filesProcessed: 1247,
          errors: []
        },
        {
          id: '2',
          jobId: '1',
          timestamp: new Date(Date.now() - 86400000),
          type: 'full',
          status: 'success',
          size: '15.2 GB',
          duration: '45 min 18 sec',
          filesProcessed: 8934,
          errors: []
        },
        {
          id: '3',
          jobId: '3',
          timestamp: new Date(Date.now() - 18000000),
          type: 'differential',
          status: 'partial',
          size: '450 MB',
          duration: '4 min 12 sec',
          filesProcessed: 234,
          errors: ['Timeout su 2 file di grandi dimensioni']
        }
      ];

      setBackupLocations(mockLocations);
      setBackupJobs(mockJobs);
      setBackupHistory(mockHistory);
    } catch (error) {
      toast({
        title: 'Errore caricamento',
        description: 'Impossibile caricare i dati di backup',
        variant: 'destructive'
      });
    }
  };

  const calculateBackupStats = () => {
    setTotalBackups(156);
    setSuccessfulBackups(152);
    setStorageUsed(75); // percentuale
  };

  const runBackupNow = async (jobId: string) => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      const job = backupJobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job non trovato');

      // Simula processo di backup
      for (let i = 0; i <= 100; i += 2) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Aggiorna stato job
      setBackupJobs(prev =>
        prev.map(j =>
          j.id === jobId
            ? { ...j, status: 'completed' as const, lastRun: new Date() }
            : j
        )
      );

      // Aggiungi alla cronologia
      const newHistoryItem: BackupHistory = {
        id: Date.now().toString(),
        jobId,
        timestamp: new Date(),
        type: job.type,
        status: 'success',
        size: job.size,
        duration: '5 min 23 sec',
        filesProcessed: Math.floor(Math.random() * 1000) + 500,
        errors: []
      };

      setBackupHistory(prev => [newHistoryItem, ...prev]);

      toast({
        title: 'Backup completato',
        description: `Backup "${job.name}" completato con successo`
      });
    } catch (error) {
      toast({
        title: 'Errore backup',
        description: 'Impossibile completare il backup',
        variant: 'destructive'
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const restoreFromBackup = async (historyId: string) => {
    try {
      const backupItem = backupHistory.find(h => h.id === historyId);
      if (!backupItem) throw new Error('Backup non trovato');

      // Simula processo di ripristino
      toast({
        title: 'Ripristino avviato',
        description: 'Il ripristino dei dati è stato avviato'
      });

      // In un'app reale, qui ci sarebbe la logica di ripristino
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Ripristino completato',
        description: 'I dati sono stati ripristinati con successo'
      });
    } catch (error) {
      toast({
        title: 'Errore ripristino',
        description: 'Impossibile ripristinare i dati',
        variant: 'destructive'
      });
    }
  };

  const deleteBackup = async (historyId: string) => {
    try {
      setBackupHistory(prev => prev.filter(h => h.id !== historyId));
      toast({
        title: 'Backup eliminato',
        description: 'Il backup è stato eliminato con successo'
      });
    } catch (error) {
      toast({
        title: 'Errore eliminazione',
        description: 'Impossibile eliminare il backup',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cloud': return <Cloud className="h-4 w-4" />;
      case 'local': return <HardDrive className="h-4 w-4" />;
      case 'hybrid': return <Globe className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Database className="h-4 w-4" />;
      case 'incremental': return <Upload className="h-4 w-4" />;
      case 'differential': return <RefreshCw className="h-4 w-4" />;
      default: return <Archive className="h-4 w-4" />;
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
              Effettua l'accesso per gestire i backup dei tuoi dati
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Backup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBackups}</p>
                <p className="text-sm text-gray-600">Backup Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successfulBackups}</p>
                <p className="text-sm text-gray-600">Backup Riusciti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{storageUsed}%</p>
                <p className="text-sm text-gray-600">Storage Utilizzato</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1h</p>
                <p className="text-sm text-gray-600">Ultimo Backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impostazioni Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Impostazioni Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Backup Automatico</Label>
                <p className="text-sm text-gray-600">
                  Esegui backup automatici secondo pianificazione
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            <div>
              <Label>Frequenza Backup</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Ogni ora</SelectItem>
                  <SelectItem value="daily">Giornaliero</SelectItem>
                  <SelectItem value="weekly">Settimanale</SelectItem>
                  <SelectItem value="monthly">Mensile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Conservazione (giorni)</Label>
              <Select value={retentionDays.toString()} onValueChange={(value) => setRetentionDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 giorni</SelectItem>
                  <SelectItem value="30">30 giorni</SelectItem>
                  <SelectItem value="90">90 giorni</SelectItem>
                  <SelectItem value="365">1 anno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress */}
          {isBackingUp && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Backup in corso...</span>
                <span className="text-sm">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destinazioni Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Destinazioni Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backupLocations.map((location) => (
              <div key={location.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(location.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{location.name}</h4>
                    <p className="text-sm text-gray-600">{location.provider}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {location.encrypted && <Lock className="h-4 w-4 text-green-600" />}
                    {location.available ? (
                      <Badge className="bg-green-100 text-green-800">Attivo</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Offline</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilizzo:</span>
                    <span>{location.used} / {location.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(parseInt(location.used) / parseInt(location.capacity)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Ultimo sync: {location.lastSync.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job di Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Job di Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getBackupTypeIcon(job.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{job.name}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Badge variant="outline">
                          {job.type === 'full' ? 'Completo' : 
                           job.type === 'incremental' ? 'Incrementale' : 'Differenziale'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Pianificazione: {job.schedule}</p>
                          <p className="text-gray-600">Ultimo: {job.lastRun.toLocaleString()}</p>
                          <p className="text-gray-600">Prossimo: {job.nextRun.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Dimensione: {job.size}</p>
                          <p className="text-gray-600">Durata: {job.duration}</p>
                          <p className="text-gray-600">Destinazione: {job.destination}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Tipi di dati:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.dataTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => runBackupNow(job.id)}
                      disabled={isBackingUp || job.status === 'running'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Esegui Ora
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cronologia Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cronologia Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((item) => {
              const job = backupJobs.find(j => j.id === item.jobId);
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getBackupTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">
                            {job?.name || 'Job sconosciuto'}
                          </h4>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline">
                            {item.type === 'full' ? 'Completo' : 
                             item.type === 'incremental' ? 'Incrementale' : 'Differenziale'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Data: {item.timestamp.toLocaleString()}</p>
                            <p className="text-gray-600">Durata: {item.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dimensione: {item.size}</p>
                            <p className="text-gray-600">File processati: {item.filesProcessed.toLocaleString()}</p>
                          </div>
                          <div>
                            {item.errors.length > 0 && (
                              <div>
                                <p className="text-red-600 font-medium">Errori:</p>
                                {item.errors.map((error, index) => (
                                  <p key={index} className="text-red-600 text-xs">{error}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreFromBackup(item.id)}
                        disabled={item.status !== 'success'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Ripristina
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBackup(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;