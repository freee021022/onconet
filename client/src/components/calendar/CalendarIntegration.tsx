import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Smartphone, RefreshCw, Download, Upload, 
  Check, AlertCircle, Clock, Bell, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'appointment' | 'reminder' | 'follow-up';
  source: 'onconet' | 'external';
  synced: boolean;
}

interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: Date;
  supportedFeatures: string[];
}

const CalendarIntegration = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const calendarProviders: CalendarProvider[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: <div className="w-4 h-4 bg-blue-600 rounded"></div>,
      connected: false,
      supportedFeatures: ['sync', 'reminders', 'invites']
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: <div className="w-4 h-4 bg-blue-800 rounded"></div>,
      connected: false,
      supportedFeatures: ['sync', 'reminders']
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: <div className="w-4 h-4 bg-gray-800 rounded"></div>,
      connected: false,
      supportedFeatures: ['sync', 'reminders']
    },
    {
      id: 'device',
      name: 'Calendario del dispositivo',
      icon: <Smartphone className="w-4 h-4" />,
      connected: true, // Always available on mobile devices
      supportedFeatures: ['sync', 'reminders', 'notifications']
    }
  ];

  // Sample events for demonstration
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Visita oncologica',
        description: 'Controllo di routine con Dr. Rossi',
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000), // +1 hour
        location: 'Ospedale San Giovanni',
        type: 'appointment',
        source: 'onconet',
        synced: false
      },

      {
        id: '2',
        title: 'Seconda opinione',
        description: 'Consultazione con specialista',
        startTime: new Date(Date.now() + 172800000), // Day after tomorrow
        endTime: new Date(Date.now() + 172800000 + 1800000), // +30 minutes
        type: 'appointment',
        source: 'onconet',
        synced: false
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // Connect to calendar provider
  const connectProvider = async (providerId: string) => {
    setIsSyncing(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (providerId === 'device') {
        // For device calendar, request permission
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast({
              title: 'Calendario collegato',
              description: 'Sincronizzazione con il calendario del dispositivo attivata.'
            });
          }
        }
      } else {
        // For external providers, simulate OAuth flow
        toast({
          title: 'Autorizzazione richiesta',
          description: `Autorizza Onconet ad accedere al tuo ${calendarProviders.find(p => p.id === providerId)?.name}.`
        });
      }
      
      setSelectedProvider(providerId);
      setSyncEnabled(true);
      
    } catch (error) {
      toast({
        title: 'Errore connessione',
        description: 'Impossibile collegare il calendario. Riprova più tardi.',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync events to external calendar
  const syncEvents = async () => {
    if (!selectedProvider) return;
    
    setIsSyncing(true);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mark events as synced
      setEvents(prev => prev.map(event => ({ ...event, synced: true })));
      
      toast({
        title: 'Sincronizzazione completata',
        description: `${events.length} eventi sincronizzati con successo.`
      });
      
    } catch (error) {
      toast({
        title: 'Errore sincronizzazione',
        description: 'Alcuni eventi potrebbero non essere stati sincronizzati.',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Create device calendar event (Web Share API / Calendar API simulation)
  const createDeviceEvent = async (event: CalendarEvent) => {
    try {
      // For real implementation, would use device calendar APIs
      if ('share' in navigator) {
        await navigator.share({
          title: event.title,
          text: `${event.description}\n${event.startTime.toLocaleString('it-IT')}`,
          url: window.location.href
        });
      } else {
        // Fallback: create ICS file for download
        const icsContent = generateICSContent(event);
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title}.ics`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: 'Evento aggiunto',
        description: 'L\'evento è stato aggiunto al calendario.'
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere l\'evento al calendario.',
        variant: 'destructive'
      });
    }
  };

  // Generate ICS (iCalendar) content
  const generateICSContent = (event: CalendarEvent): string => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Onconet//Onconet Calendar//IT
BEGIN:VEVENT
UID:${event.id}@onconet.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Promemoria: ${event.title}
TRIGGER:-PT${reminderMinutes}M
END:VALARM
END:VEVENT
END:VCALENDAR`;
  };

  // Schedule notification reminder
  const scheduleNotification = (event: CalendarEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const reminderTime = new Date(event.startTime.getTime() - (reminderMinutes * 60 * 1000));
      const now = new Date();
      
      if (reminderTime > now) {
        const timeout = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          new Notification(`Promemoria: ${event.title}`, {
            body: event.description || `Evento alle ${event.startTime.toLocaleTimeString('it-IT')}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }, timeout);
      }
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';

      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'follow-up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment': return 'Appuntamento';

      case 'reminder': return 'Promemoria';
      case 'follow-up': return 'Follow-up';
      default: return 'Evento';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-2">Accesso richiesto</h3>
          <p className="text-gray-600">Accedi per sincronizzare i tuoi appuntamenti.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integrazione Calendario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Provider Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Provider calendario</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {calendarProviders.map((provider) => (
                <Card 
                  key={provider.id} 
                  className={`cursor-pointer transition-all ${
                    selectedProvider === provider.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => !provider.connected && connectProvider(provider.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {provider.icon}
                        <div>
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-xs text-gray-600">
                            {provider.connected ? 'Connesso' : 'Non connesso'}
                          </div>
                        </div>
                      </div>
                      
                      {selectedProvider === provider.id && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sync Settings */}
          {selectedProvider && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sync-enabled">Sincronizzazione automatica</Label>
                  <p className="text-sm text-gray-600">Sincronizza automaticamente gli eventi</p>
                </div>
                <Switch
                  id="sync-enabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Auto-sync periodico</Label>
                  <p className="text-sm text-gray-600">Sincronizza ogni ora</p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                  disabled={!syncEnabled}
                />
              </div>

              <div>
                <Label htmlFor="reminder-time">Promemoria (minuti prima)</Label>
                <Select value={reminderMinutes.toString()} onValueChange={(value) => setReminderMinutes(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minuti</SelectItem>
                    <SelectItem value="15">15 minuti</SelectItem>
                    <SelectItem value="30">30 minuti</SelectItem>
                    <SelectItem value="60">1 ora</SelectItem>
                    <SelectItem value="120">2 ore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={syncEvents} 
                  disabled={isSyncing || !syncEnabled}
                  className="flex items-center gap-2"
                >
                  {isSyncing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {isSyncing ? 'Sincronizzando...' : 'Sincronizza ora'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Prossimi Eventi</CardTitle>
            <Badge variant="secondary">{events.length} eventi</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {event.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-600" />}
                  {event.type === 'medication' && <Bell className="h-4 w-4 text-green-600" />}
                  {event.type === 'reminder' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {event.type === 'follow-up' && <Settings className="h-4 w-4 text-purple-600" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{event.startTime.toLocaleDateString('it-IT')}</span>
                        <span>{event.startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        {event.location && <span>{event.location}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      
                      {event.synced ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createDeviceEvent(event)}
                    className="h-7 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => scheduleNotification(event)}
                    className="h-7 px-2"
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun evento programmato</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      {syncEnabled && selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stato Sincronizzazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Connesso a {calendarProviders.find(p => p.id === selectedProvider)?.name}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Ultima sincronizzazione: {new Date().toLocaleTimeString('it-IT')}
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              {events.filter(e => e.synced).length} di {events.length} eventi sincronizzati
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarIntegration;
