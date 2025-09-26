import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, WifiOff, Download, Upload, RefreshCw, Check, 
  Clock, AlertCircle, Database 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineItem {
  id: string;
  type: 'appointment' | 'document' | 'message' | 'review';
  title: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

interface CachedData {
  pharmacies: any[];
  doctors: any[];
  userProfile: any;
  emergencyContacts: any[];
  lastUpdate: Date;
}

const OfflineSync = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState<OfflineItem[]>([]);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Connessione ripristinata',
        description: 'Sincronizzazione dati in corso...'
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Modalità offline attiva',
        description: 'I tuoi dati sono disponibili offline.',
        variant: 'destructive'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data on component mount
  useEffect(() => {
    loadOfflineData();
    calculateStorageUsage();
  }, []);

  // Cache essential data for offline use
  const cacheEssentialData = async () => {
    try {
      const [pharmacies, doctors, userProfile, emergencyContacts] = await Promise.all([
        fetch('/api/pharmacies').then(r => r.json()).catch(() => []),
        fetch('/api/doctors').then(r => r.json()).catch(() => []),
        fetch('/api/user/profile').then(r => r.json()).catch(() => null),
        fetch('/api/emergency-contacts').then(r => r.json()).catch(() => [])
      ]);

      const cachedData: CachedData = {
        pharmacies,
        doctors,
        userProfile,
        emergencyContacts,
        lastUpdate: new Date()
      };

      localStorage.setItem('onconet_offline_cache', JSON.stringify(cachedData));
      setCachedData(cachedData);

      toast({
        title: 'Dati salvati offline',
        description: 'Le informazioni essenziali sono disponibili offline.'
      });
    } catch (error) {
      toast({
        title: 'Errore cache',
        description: 'Impossibile salvare i dati offline.',
        variant: 'destructive'
      });
    }
  };

  // Load offline data from localStorage
  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('onconet_offline_cache');
      const pending = localStorage.getItem('onconet_pending_sync');

      if (cached) {
        setCachedData(JSON.parse(cached));
      }

      if (pending) {
        setPendingItems(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  // Add item to pending sync queue
  const addToPendingSync = (item: Omit<OfflineItem, 'id' | 'synced'>) => {
    const newItem: OfflineItem = {
      ...item,
      id: Date.now().toString(),
      synced: false
    };

    const updated = [...pendingItems, newItem];
    setPendingItems(updated);
    localStorage.setItem('onconet_pending_sync', JSON.stringify(updated));
  };

  // Sync pending data when back online
  const syncPendingData = async () => {
    if (!isOnline || pendingItems.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const totalItems = pendingItems.length;
    let syncedCount = 0;

    for (const item of pendingItems) {
      try {
        await syncSingleItem(item);
        syncedCount++;
        setSyncProgress((syncedCount / totalItems) * 100);
      } catch (error) {
        console.error('Sync error for item:', item.id, error);
      }
    }

    // Remove synced items
    const remainingItems = pendingItems.filter(item => !item.synced);
    setPendingItems(remainingItems);
    localStorage.setItem('onconet_pending_sync', JSON.stringify(remainingItems));

    setIsSyncing(false);
    setSyncProgress(0);

    if (remainingItems.length === 0) {
      toast({
        title: 'Sincronizzazione completata',
        description: 'Tutti i dati sono stati sincronizzati con successo.'
      });
    } else {
      toast({
        title: 'Sincronizzazione parziale',
        description: `${syncedCount} di ${totalItems} elementi sincronizzati.`,
        variant: 'destructive'
      });
    }
  };

  // Sync a single item
  const syncSingleItem = async (item: OfflineItem): Promise<void> => {
    const endpoints = {
      appointment: '/api/appointments',
      document: '/api/medical-records/upload',
      message: '/api/forum/posts',
      review: '/api/reviews'
    };

    const endpoint = endpoints[item.type];
    if (!endpoint) throw new Error('Unknown item type');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) throw new Error('Sync failed');

    item.synced = true;
  };

  // Calculate storage usage
  const calculateStorageUsage = () => {
    try {
      let totalSize = 0;
      
      for (const key in localStorage) {
        if (key.startsWith('onconet_')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        }
      }

      // Convert to MB and calculate percentage (assume 10MB limit)
      const usageMB = totalSize / (1024 * 1024);
      const percentage = (usageMB / 10) * 100;
      setStorageUsage(Math.min(percentage, 100));
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  };

  // Clear offline data
  const clearOfflineData = () => {
    localStorage.removeItem('onconet_offline_cache');
    localStorage.removeItem('onconet_pending_sync');
    setCachedData(null);
    setPendingItems([]);
    setStorageUsage(0);
    toast({
      title: 'Dati offline eliminati',
      description: 'Cache locale svuotata con successo.'
    });
  };

  const formatDataAge = (date: Date): string => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Aggiornato ora';
    if (diffHours < 24) return `${diffHours}h fa`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}g fa`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Stato Connessione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {isOnline 
                  ? 'Connesso ai server Onconet' 
                  : 'Utilizzando dati memorizzati localmente'
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={cacheEssentialData}
                disabled={!isOnline}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Salva per offline
              </Button>
              
              {!isOnline && pendingItems.length > 0 && (
                <Button
                  onClick={syncPendingData}
                  disabled={!isOnline || isSyncing}
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizza
                </Button>
              )}
            </div>
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Sincronizzazione in corso...</span>
                <span className="text-sm">{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cached Data Status */}
      {cachedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dati Offline Disponibili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cachedData.pharmacies.length}
                </div>
                <div className="text-sm text-gray-600">Farmacie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cachedData.doctors.length}
                </div>
                <div className="text-sm text-gray-600">Medici</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cachedData.emergencyContacts.length}
                </div>
                <div className="text-sm text-gray-600">Contatti emergenza</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {cachedData.userProfile ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600">Profilo utente</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Ultimo aggiornamento: {formatDataAge(new Date(cachedData.lastUpdate))}
              </div>
              
              <Button
                onClick={clearOfflineData}
                variant="outline"
                size="sm"
                className="text-red-600"
              >
                Elimina cache
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Sync Items */}
      {pendingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              In Attesa di Sincronizzazione
              <Badge variant="secondary">{pendingItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.synced ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {item.synced ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600">
                        {item.type === 'appointment' && 'Appuntamento'}
                        {item.type === 'document' && 'Documento medico'}
                        {item.type === 'message' && 'Messaggio forum'}
                        {item.type === 'review' && 'Recensione'}
                        {' • '}
                        {item.timestamp.toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>

                  <Badge variant={item.synced ? 'default' : 'secondary'}>
                    {item.synced ? 'Sincronizzato' : 'In attesa'}
                  </Badge>
                </div>
              ))}
            </div>

            {!isOnline && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Sincronizzazione sospesa
                  </span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  I dati verranno sincronizzati automaticamente quando la connessione sarà ripristinata.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Utilizzo Memoria Locale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Spazio utilizzato</span>
                <span>{storageUsage.toFixed(1)}% di 10 MB</span>
              </div>
              <Progress value={storageUsage} className="h-2" />
            </div>

            {storageUsage > 80 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Spazio quasi esaurito
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Considera di eliminare i dati offline più vecchi per liberare spazio.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Cache dati</div>
                <div className="font-medium">{(storageUsage * 0.7).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending sync</div>
                <div className="font-medium">{(storageUsage * 0.2).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Altri dati</div>
                <div className="font-medium">{(storageUsage * 0.1).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSync;