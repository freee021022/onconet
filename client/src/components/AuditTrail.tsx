import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, Shield, Clock, User, FileText, Settings, 
  Search, Filter, Download, AlertTriangle, Check,
  Database, MessageSquare, Lock, Unlock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'suspicious';
}

interface AuditFilter {
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  action?: string;
  riskLevel?: string;
  status?: string;
  searchTerm?: string;
}

const AuditTrail = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [suspiciousEvents, setSuspiciousEvents] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadAuditEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [auditEvents, filters]);

  const loadAuditEvents = async () => {
    setIsLoading(true);
    try {
      // Simula caricamento eventi audit
      const mockEvents: AuditEvent[] = [
        {
          id: '1',
          timestamp: new Date(),
          userId: user?.id || '1',
          userName: user?.firstName || 'Mario Rossi',
          action: 'Accesso Sistema',
          resource: 'Dashboard',
          resourceId: 'dashboard',
          details: 'Login effettuato con successo',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          riskLevel: 'low',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000),
          userId: user?.id || '1',
          userName: user?.firstName || 'Mario Rossi',
          action: 'Visualizzazione',
          resource: 'Cartella Clinica',
          resourceId: 'medical_record_123',
          details: 'Visualizzata cartella clinica paziente',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          riskLevel: 'medium',
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000),
          userId: '2',
          userName: 'Dr. Anna Bianchi',
          action: 'Modifica',
          resource: 'Profilo Medico',
          resourceId: 'doctor_profile_2',
          details: 'Aggiornate specializzazioni',
          ipAddress: '10.0.0.25',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          riskLevel: 'low',
          status: 'success'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 900000),
          userId: 'unknown',
          userName: 'Utente Sconosciuto',
          action: 'Tentativo Accesso',
          resource: 'Sistema Login',
          resourceId: 'login',
          details: 'Tentativo di accesso con credenziali non valide',
          ipAddress: '203.0.113.45',
          userAgent: 'curl/7.68.0',
          riskLevel: 'critical',
          status: 'failed'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1200000),
          userId: user?.id || '1',
          userName: user?.firstName || 'Mario Rossi',
          action: 'Download',
          resource: 'Documento',
          resourceId: 'document_456',
          details: 'Scaricato referto medico',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          riskLevel: 'medium',
          status: 'success'
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 1800000),
          userId: '3',
          userName: 'Sistema Automatico',
          action: 'Backup',
          resource: 'Database',
          resourceId: 'db_backup',
          details: 'Backup automatico completato',
          ipAddress: '127.0.0.1',
          userAgent: 'OnconetBackupService/1.0',
          riskLevel: 'low',
          status: 'success'
        }
      ];

      setAuditEvents(mockEvents);
      setTotalEvents(mockEvents.length);
      setSuspiciousEvents(mockEvents.filter(e => e.status === 'failed' || e.riskLevel === 'critical').length);
      setFailedAttempts(mockEvents.filter(e => e.status === 'failed').length);
    } catch (error) {
      toast({
        title: 'Errore caricamento',
        description: 'Impossibile caricare gli eventi audit',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...auditEvents];

    // Filtro per data
    if (filters.dateFrom) {
      filtered = filtered.filter(event => event.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(event => event.timestamp <= filters.dateTo!);
    }

    // Filtro per utente
    if (filters.userId) {
      filtered = filtered.filter(event => event.userId === filters.userId);
    }

    // Filtro per azione
    if (filters.action) {
      filtered = filtered.filter(event => event.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }

    // Filtro per livello di rischio
    if (filters.riskLevel) {
      filtered = filtered.filter(event => event.riskLevel === filters.riskLevel);
    }

    // Filtro per stato
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Filtro per termine di ricerca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.userName.toLowerCase().includes(term) ||
        event.action.toLowerCase().includes(term) ||
        event.resource.toLowerCase().includes(term) ||
        event.details.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  };

  const exportAuditLog = async () => {
    try {
      const data = filteredEvents.map(event => ({
        Timestamp: event.timestamp.toISOString(),
        User: event.userName,
        Action: event.action,
        Resource: event.resource,
        Details: event.details,
        IP: event.ipAddress,
        Status: event.status,
        RiskLevel: event.riskLevel
      }));

      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast({
        title: 'Export completato',
        description: 'Log audit esportato con successo'
      });
    } catch (error) {
      toast({
        title: 'Errore export',
        description: 'Impossibile esportare il log audit',
        variant: 'destructive'
      });
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'suspicious': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Accesso')) return <Lock className="h-4 w-4" />;
    if (action.includes('Visualizzazione')) return <Eye className="h-4 w-4" />;
    if (action.includes('Modifica')) return <Settings className="h-4 w-4" />;
    if (action.includes('Download')) return <Download className="h-4 w-4" />;
    if (action.includes('Backup')) return <Database className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
            <p className="text-gray-600">
              Effettua l'accesso per visualizzare il log audit
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-sm text-gray-600">Eventi Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suspiciousEvents}</p>
                <p className="text-sm text-gray-600">Eventi Sospetti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Unlock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{failedAttempts}</p>
                <p className="text-sm text-gray-600">Accessi Falliti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Ricerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cerca utente, azione, risorsa..."
                  className="pl-9"
                  value={filters.searchTerm || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Livello Rischio</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value === 'all' ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i livelli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i livelli</SelectItem>
                  <SelectItem value="low">Basso</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Critico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stato</Label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="success">Successo</SelectItem>
                  <SelectItem value="failed">Fallito</SelectItem>
                  <SelectItem value="suspicious">Sospetto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              size="sm"
            >
              Azzera Filtri
            </Button>
            <Button
              onClick={exportAuditLog}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Esporta Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista Eventi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Log Eventi ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Caricamento eventi...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(event.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.action}</h4>
                          <Badge className={getRiskLevelColor(event.riskLevel)}>
                            {event.riskLevel}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status === 'success' && <Check className="h-3 w-3 mr-1" />}
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.userName}
                          </span>
                          <span>Risorsa: {event.resource}</span>
                          <span>IP: {event.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{event.timestamp.toLocaleDateString()}</div>
                      <div>{event.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;